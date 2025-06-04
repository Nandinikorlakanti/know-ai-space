
from fastapi import FastAPI, UploadFile, Form, HTTPException, Depends, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sentence_transformers import SentenceTransformer, util
from transformers import pipeline
import uuid
import faiss
import os
import json
import numpy as np
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# CORS setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
try:
    embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    qa_pipeline = pipeline("question-answering", model="deepset/roberta-base-squad2")
    zero_shot_classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    logger.info("All models loaded successfully")
except Exception as e:
    logger.error(f"Error loading models: {e}")
    embedding_model = None
    qa_pipeline = None
    zero_shot_classifier = None

# In-memory storage (replace with database in production)
pages = {}  # page_id -> {...}
workspaces = {}  # workspace_name -> data
index = faiss.IndexFlatL2(384) if embedding_model else None
page_ids = []

class PageInput(BaseModel):
    title: str
    content: str
    workspace: str
    tags: Optional[List[str]] = []

class UpdatePageInput(BaseModel):
    page_id: str
    title: Optional[str]
    content: Optional[str]
    tags: Optional[List[str]]

class QuestionInput(BaseModel):
    question: str
    workspace: str

class AutoLinkInput(BaseModel):
    workspace: str
    text: str

class TagGenerationInput(BaseModel):
    workspace: str
    content: Optional[str] = None

def ensure_workspace(workspace_name: str):
    """Ensure workspace exists in memory"""
    if workspace_name not in workspaces:
        workspaces[workspace_name] = {
            "name": workspace_name,
            "pages": [],
            "created_at": "2024-01-01"
        }
    return workspaces[workspace_name]

@app.get("/")
def root():
    return {"message": "FastAPI backend for AI features is running!"}

@app.post("/add_page")
def add_page(page: PageInput):
    try:
        page_id = str(uuid.uuid4())
        
        # Ensure workspace exists
        ensure_workspace(page.workspace)
        
        if embedding_model and index is not None:
            embedding = embedding_model.encode(page.content)
        else:
            embedding = np.random.rand(384)  # Fallback for testing
        
        pages[page_id] = {
            "id": page_id,
            "title": page.title,
            "content": page.content,
            "workspace": page.workspace,
            "tags": page.tags or [],
            "embedding": embedding,
            "created_at": "2024-01-01"
        }
        
        if index is not None:
            index.add(embedding.reshape(1, -1))
        page_ids.append(page_id)
        
        # Add to workspace
        workspaces[page.workspace]["pages"].append(page_id)
        
        logger.info(f"Added page {page_id} to workspace {page.workspace}")
        return {"status": "success", "page_id": page_id}
        
    except Exception as e:
        logger.error(f"Error adding page: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/update_page")
def update_page(update: UpdatePageInput):
    try:
        if update.page_id not in pages:
            raise HTTPException(status_code=404, detail="Page not found")

        if update.title:
            pages[update.page_id]["title"] = update.title
        if update.content:
            pages[update.page_id]["content"] = update.content
            if embedding_model:
                pages[update.page_id]["embedding"] = embedding_model.encode(update.content)
        if update.tags is not None:
            pages[update.page_id]["tags"] = update.tags

        return {"status": "updated"}
    except Exception as e:
        logger.error(f"Error updating page: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete_page/{page_id}")
def delete_page(page_id: str):
    try:
        if page_id not in pages:
            raise HTTPException(status_code=404, detail="Page not found")
        
        workspace = pages[page_id]["workspace"]
        pages.pop(page_id)
        
        # Remove from workspace
        if workspace in workspaces and page_id in workspaces[workspace]["pages"]:
            workspaces[workspace]["pages"].remove(page_id)
        
        return {"status": "deleted"}
    except Exception as e:
        logger.error(f"Error deleting page: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask")
def ask_question(query: QuestionInput):
    try:
        if not qa_pipeline:
            return {"answer": "Question answering model not available"}
        
        # Get all content from workspace
        workspace_content = []
        for page_id, page_data in pages.items():
            if page_data["workspace"] == query.workspace:
                workspace_content.append(f"Title: {page_data['title']}\nContent: {page_data['content']}")
        
        if not workspace_content:
            return {"answer": "No content found in the workspace to search through. Please add some documents first."}
        
        context = "\n\n".join(workspace_content)
        
        # Limit context length for the model
        if len(context) > 3000:
            context = context[:3000] + "..."
        
        result = qa_pipeline(question=query.question, context=context)
        
        logger.info(f"Q&A result: {result}")
        return {"answer": result["answer"], "score": result.get("score", 0)}
        
    except Exception as e:
        logger.error(f"Error in Q&A: {e}")
        return {"answer": f"Sorry, I encountered an error while processing your question: {str(e)}"}

@app.post("/extract_links")
def extract_links(data: AutoLinkInput):
    try:
        if not embedding_model or index is None:
            return {"suggestions": []}
        
        query_embedding = embedding_model.encode(data.text)
        
        # Find similar pages in the workspace
        suggestions = []
        for page_id, page_data in pages.items():
            if page_data["workspace"] != data.workspace:
                continue
                
            similarity = float(util.cos_sim(query_embedding, page_data["embedding"]))
            
            if similarity > 0.3:  # Threshold for relevance
                suggestions.append({
                    "id": page_id,
                    "targetPage": page_data["title"],
                    "confidence": similarity,
                    "reason": f"Semantic similarity: {similarity:.2f}",
                    "preview": page_data["content"][:150] + "..." if len(page_data["content"]) > 150 else page_data["content"],
                    "type": "semantic" if similarity > 0.6 else "contextual"
                })
        
        # Sort by confidence and return top 5
        suggestions.sort(key=lambda x: x["confidence"], reverse=True)
        return {"suggestions": suggestions[:5]}
        
    except Exception as e:
        logger.error(f"Error extracting links: {e}")
        return {"suggestions": []}

@app.post("/generate_tags")
def generate_tags(data: TagGenerationInput):
    try:
        if not zero_shot_classifier:
            return {"error": "Auto-tagging model not available"}
        
        # Get content to analyze
        if data.content:
            content = data.content
        else:
            # Analyze all content in workspace
            workspace_content = []
            for page_id, page_data in pages.items():
                if page_data["workspace"] == data.workspace:
                    workspace_content.append(page_data["content"])
            content = "\n".join(workspace_content)
        
        if not content.strip():
            return {"tags": [], "message": "No content found to analyze"}
        
        # Predefined tag categories
        candidate_labels = [
            "meeting", "strategy", "research", "todo", "idea", "project", "documentation",
            "notes", "planning", "brainstorming", "analysis", "report", "presentation",
            "technical", "business", "creative", "personal", "urgent", "completed",
            "in-progress", "review", "collaboration", "learning", "reference"
        ]
        
        # Limit content length
        if len(content) > 1000:
            content = content[:1000]
        
        result = zero_shot_classifier(content, candidate_labels)
        
        # Filter tags with confidence > 0.3
        tags = []
        for label, score in zip(result['labels'], result['scores']):
            if score > 0.3:
                tags.append({
                    "name": label,
                    "confidence": round(score, 3),
                    "auto_generated": True
                })
        
        return {
            "tags": tags[:10],  # Return top 10 tags
            "total_content_length": len(content)
        }
        
    except Exception as e:
        logger.error(f"Error generating tags: {e}")
        return {"error": f"Failed to generate tags: {str(e)}"}

@app.get("/workspace_documents/{workspace}")
def get_workspace_documents(workspace: str):
    try:
        documents = []
        for page_id, page_data in pages.items():
            if page_data["workspace"] == workspace:
                documents.append({
                    "id": page_id,
                    "name": page_data["title"],
                    "title": page_data["title"]
                })
        
        return {"documents": documents}
    except Exception as e:
        logger.error(f"Error getting workspace documents: {e}")
        return {"documents": []}

@app.get("/list_pages/{workspace}")
def list_pages(workspace: str):
    try:
        result = []
        for page_id, page_data in pages.items():
            if page_data["workspace"] == workspace:
                result.append({
                    "page_id": page_id,
                    "title": page_data["title"],
                    "tags": page_data.get("tags", [])
                })
        return result
    except Exception as e:
        logger.error(f"Error listing pages: {e}")
        return []

@app.get("/knowledge_graph/{workspace}")
def knowledge_graph(workspace: str):
    try:
        if not embedding_model:
            return {"nodes": [], "edges": [], "error": "Embedding model not available"}
        
        nodes = []
        edges = []
        
        workspace_pages = {pid: data for pid, data in pages.items() if data["workspace"] == workspace}
        
        for pid, data in workspace_pages.items():
            nodes.append({
                "id": pid,
                "label": data["title"],
                "size": len(data["content"]) / 100,  # Node size based on content length
                "tags": data.get("tags", [])
            })
            
            source_vec = data["embedding"]
            for other_id, other_data in workspace_pages.items():
                if other_id == pid:
                    continue
                    
                score = float(util.cos_sim(source_vec, other_data["embedding"]))
                if score > 0.4:  # Threshold for edge creation
                    edges.append({
                        "source": pid,
                        "target": other_id,
                        "weight": round(score, 2),
                        "type": "semantic"
                    })
        
        return {"nodes": nodes, "edges": edges}
        
    except Exception as e:
        logger.error(f"Error generating knowledge graph: {e}")
        return {"nodes": [], "edges": [], "error": str(e)}

@app.get("/workspaces")
def list_workspaces():
    try:
        return list(workspaces.keys())
    except Exception as e:
        logger.error(f"Error listing workspaces: {e}")
        return []

@app.post("/create_workspace")
def create_workspace(workspace_name: str = Form(...)):
    try:
        ensure_workspace(workspace_name)
        return {"message": f"Workspace '{workspace_name}' created successfully"}
    except Exception as e:
        logger.error(f"Error creating workspace: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload_file/{workspace_name}")
async def upload_file(workspace_name: str, file: UploadFile = File(...)):
    try:
        ensure_workspace(workspace_name)
        
        content = await file.read()
        content_str = content.decode('utf-8')
        
        # Create a page from the uploaded file
        page_input = PageInput(
            title=file.filename or "Uploaded File",
            content=content_str,
            workspace=workspace_name,
            tags=["uploaded"]
        )
        
        result = add_page(page_input)
        return {"message": f"File '{file.filename}' uploaded successfully", "page_id": result["page_id"]}
        
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
