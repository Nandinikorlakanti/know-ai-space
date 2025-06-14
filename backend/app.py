
import os
from pathlib import Path
from transformers import pipeline
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import re
from collections import Counter

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the absolute path of the project directory
PROJECT_ROOT = Path(__file__).parent.parent.absolute()

# Initialize pipelines globally
qa_pipeline = None
feature_extraction_pipeline = None
zero_shot_classifier = None

def initialize_models():
    global qa_pipeline, feature_extraction_pipeline, zero_shot_classifier
    try:
        # Initialize QA pipeline with a more reliable model
        qa_pipeline = pipeline(
            "question-answering", 
            model="distilbert-base-cased-distilled-squad",
            tokenizer="distilbert-base-cased-distilled-squad"
        )
        logger.info("QA pipeline initialized successfully")
        
        # Initialize feature extraction for AI linker
        feature_extraction_pipeline = pipeline(
            "feature-extraction",
            model="sentence-transformers/all-MiniLM-L6-v2"
        )
        logger.info("Feature extraction pipeline initialized successfully")
        
        # Initialize zero-shot classification for auto-tagging
        zero_shot_classifier = pipeline(
            "zero-shot-classification",
            model="facebook/bart-large-mnli"
        )
        logger.info("Zero-shot classifier initialized successfully")
        
    except Exception as e:
        logger.error(f"Error loading pipelines: {e}")
        qa_pipeline = None
        feature_extraction_pipeline = None
        zero_shot_classifier = None

# Initialize models on startup
initialize_models()

app = Flask(__name__)
CORS(app)

def ensure_workspace(workspace_name):
    safe_workspace_name = ''.join(c for c in workspace_name if c.isalnum() or c in ('-', '_')).rstrip()
    if not safe_workspace_name:
        raise ValueError("Invalid workspace name")
    path = PROJECT_ROOT / "workspaces" / safe_workspace_name
    path.mkdir(parents=True, exist_ok=True)
    return path

def load_workspace_content(workspace_path):
    content = ""
    logger.info(f"Scanning workspace: {workspace_path}")
    
    if not workspace_path.exists():
        logger.warning(f"Workspace not found: {workspace_path}")
        return ""
        
    for file in workspace_path.iterdir():
        logger.info(f"Checking file: {file.name}")
        if file.is_file() and file.suffix.lower() in [".txt", ".md"]:
            try:
                with open(file, "r", encoding="utf-8") as f:
                    file_content = f.read()
                    logger.info(f"Loaded {file.name} ({len(file_content)} characters)")
                    content += f"\n\n--- {file.name} ---\n{file_content}"
            except Exception as e:
                logger.error(f"Failed to read file {file.name}: {e}")
        else:
            logger.info(f"Ignored {file.name} (unsupported extension)")
    
    if not content:
        logger.warning("No readable content found in workspace.")
    else:
        logger.info(f"Total content loaded: {len(content)} characters")
    
    return content

def split_text(text, max_length=512, overlap=50):
    """Split text into overlapping chunks for better context preservation"""
    if not text:
        return []
    
    words = text.split()
    if len(words) <= max_length:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(words):
        end = min(start + max_length, len(words))
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        
        if end >= len(words):
            break
            
        start = end - overlap
    
    return chunks

def extract_keywords(text, max_keywords=10):
    """Extract important keywords from text for better tag suggestions"""
    # Remove special characters and convert to lowercase
    cleaned_text = re.sub(r'[^\w\s]', ' ', text.lower())
    words = cleaned_text.split()
    
    # Filter out common stop words
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'}
    
    # Filter words longer than 3 characters and not in stop words
    filtered_words = [word for word in words if len(word) > 3 and word not in stop_words]
    
    # Count word frequency
    word_counts = Counter(filtered_words)
    
    # Return most common words as keywords
    return [word for word, count in word_counts.most_common(max_keywords)]

def generate_auto_tags(workspace_name, file_content=None):
    """Generate automatic tags for workspace content or specific file"""
    try:
        if zero_shot_classifier is None:
            return {"error": "Auto-tagging model not available"}
        
        workspace_path = ensure_workspace(workspace_name)
        
        if file_content:
            content = file_content
        else:
            content = load_workspace_content(workspace_path)
        
        if not content.strip():
            return {"tags": [], "message": "No content found to analyze"}
        
        # Predefined tag categories
        candidate_labels = [
            "meeting", "strategy", "research", "todo", "idea", "project", "documentation",
            "notes", "planning", "brainstorming", "analysis", "report", "presentation",
            "technical", "business", "creative", "personal", "urgent", "completed",
            "in-progress", "review", "collaboration", "learning", "reference"
        ]
        
        # Extract keywords for additional context
        keywords = extract_keywords(content)
        
        # Split content into manageable chunks
        chunks = split_text(content, max_length=400)
        
        all_tags = []
        tag_confidence = {}
        
        for chunk in chunks[:5]:  # Analyze first 5 chunks to avoid overwhelming the model
            if len(chunk.split()) < 10:  # Skip very short chunks
                continue
                
            try:
                result = zero_shot_classifier(chunk, candidate_labels)
                
                # Filter tags with confidence > 0.3
                for label, score in zip(result['labels'], result['scores']):
                    if score > 0.3:
                        if label not in tag_confidence:
                            tag_confidence[label] = []
                        tag_confidence[label].append(score)
                        
            except Exception as e:
                logger.error(f"Error processing chunk: {e}")
                continue
        
        # Average confidence scores and select top tags
        final_tags = []
        for tag, scores in tag_confidence.items():
            avg_confidence = sum(scores) / len(scores)
            if avg_confidence > 0.4:  # Higher threshold for final selection
                final_tags.append({
                    "name": tag,
                    "confidence": round(avg_confidence, 3),
                    "auto_generated": True
                })
        
        # Sort by confidence and take top 10
        final_tags.sort(key=lambda x: x['confidence'], reverse=True)
        final_tags = final_tags[:10]
        
        # Add keyword-based tags if we have few auto-generated tags
        if len(final_tags) < 5 and keywords:
            for keyword in keywords[:3]:
                final_tags.append({
                    "name": keyword,
                    "confidence": 0.5,
                    "auto_generated": True,
                    "type": "keyword"
                })
        
        logger.info(f"Generated {len(final_tags)} tags for workspace '{workspace_name}'")
        
        return {
            "tags": final_tags,
            "keywords": keywords[:5],
            "total_content_length": len(content),
            "chunks_analyzed": min(len(chunks), 5)
        }
        
    except Exception as e:
        logger.error(f"Error generating auto tags: {e}")
        return {"error": f"Failed to generate tags: {str(e)}"}

def answer_question_from_workspace(workspace_name, question):
    try:
        workspace_path = ensure_workspace(workspace_name)
    except ValueError as e:
        return str(e)
        
    content = load_workspace_content(workspace_path)

    if not content.strip():
        return "No content found in the workspace to search through. Please upload some documents first."
        
    if qa_pipeline is None:
        return "Question answering model not available. Please check backend logs and try again."

    # Preprocess the question
    question = question.strip()
    if not question:
        return "Please provide a valid question."

    chunks = split_text(content, max_length=400, overlap=50)
    logger.info(f"Processing {len(chunks)} chunks for question: {question}")
    
    best_answer = {"score": 0, "answer": "I couldn't find a relevant answer in the provided documents."}

    for i, chunk in enumerate(chunks):
        try:
            if len(chunk.split()) < 5:
                continue
                
            result = qa_pipeline(question=question, context=chunk)
            logger.info(f"Chunk {i+1}: Score {result['score']:.3f}, Answer: {result['answer'][:100]}...")
            
            if result["score"] > best_answer["score"]:
                best_answer = result
                
        except Exception as e:
            logger.error(f"Error processing chunk {i+1}: {e}")
            continue

    logger.info(f"Best answer found with score: {best_answer['score']:.3f}")
    
    # Return answer with confidence indication
    if best_answer["score"] > 0.1:
        return best_answer["answer"]
    else:
        return "I couldn't find a confident answer to your question in the uploaded documents. Please try rephrasing your question or upload more relevant content."

def extract_document_links(workspace_name, current_text):
    """Extract potential links using AI feature extraction"""
    try:
        workspace_path = ensure_workspace(workspace_name)
        content = load_workspace_content(workspace_path)
        
        if not content.strip() or feature_extraction_pipeline is None:
            return []
        
        # Split content into document sections
        documents = content.split("--- ")
        document_suggestions = []
        
        for doc in documents[1:]:  # Skip first empty element
            if not doc.strip():
                continue
                
            lines = doc.split("\n")
            doc_name = lines[0].replace(" ---", "").strip()
            doc_content = "\n".join(lines[1:])
            
            # Simple keyword matching for demonstration
            # In production, you'd use more sophisticated NLP
            keywords = current_text.lower().split()
            doc_lower = doc_content.lower()
            
            relevance_score = sum(1 for keyword in keywords if keyword in doc_lower)
            
            if relevance_score > 0:
                document_suggestions.append({
                    "id": doc_name.replace(" ", "_"),
                    "targetPage": doc_name,
                    "confidence": min(relevance_score / len(keywords), 1.0),
                    "reason": f"Found {relevance_score} relevant keywords",
                    "preview": doc_content[:150] + "..." if len(doc_content) > 150 else doc_content,
                    "type": "semantic" if relevance_score > 2 else "contextual"
                })
        
        # Sort by confidence and return top 5
        document_suggestions.sort(key=lambda x: x["confidence"], reverse=True)
        return document_suggestions[:5]
        
    except Exception as e:
        logger.error(f"Error extracting links: {e}")
        return []

@app.route('/')
def index():
    return "Flask backend for AI features is running!"

@app.route('/ask', methods=['POST'])
def ask_question():
    try:
        data = request.json
        workspace_name = data.get('workspace')
        question = data.get('question')

        if not workspace_name or not question:
            return jsonify({'error': 'Missing workspace name or question'}), 400

        logger.info(f"Processing question for workspace '{workspace_name}': {question}")
        answer = answer_question_from_workspace(workspace_name, question)
        
        return jsonify({'answer': answer})
    
    except Exception as e:
        logger.error(f"Error in ask_question: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/generate_tags', methods=['POST'])
def generate_tags():
    try:
        data = request.json
        workspace_name = data.get('workspace')
        file_content = data.get('content')  # Optional: specific content to tag

        if not workspace_name:
            return jsonify({'error': 'Missing workspace name'}), 400

        logger.info(f"Generating tags for workspace '{workspace_name}'")
        result = generate_auto_tags(workspace_name, file_content)
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error in generate_tags: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/extract_links', methods=['POST'])
def extract_links():
    try:
        data = request.json
        workspace_name = data.get('workspace')
        current_text = data.get('text', '')

        if not workspace_name:
            return jsonify({'error': 'Missing workspace name'}), 400

        logger.info(f"Extracting links for workspace '{workspace_name}'")
        suggestions = extract_document_links(workspace_name, current_text)
        
        return jsonify({'suggestions': suggestions})
    
    except Exception as e:
        logger.error(f"Error in extract_links: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/create_workspace', methods=['POST'])
def create_workspace():
    try:
        data = request.json
        workspace_name = data.get('workspace')
        
        if not workspace_name:
            return jsonify({'error': 'Missing workspace name'}), 400
            
        ensure_workspace(workspace_name)
        return jsonify({'message': f'Workspace \'{workspace_name}\' created successfully'}), 201
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error creating workspace: {e}")
        return jsonify({'error': f'Failed to create workspace: {e}'}), 500

@app.route('/upload_file/<workspace_name>', methods=['POST'])
def upload_file(workspace_name):
    try:
        safe_workspace_name = ''.join(c for c in workspace_name if c.isalnum() or c in ('-', '_')).rstrip()
        if not safe_workspace_name:
            return jsonify({'error': 'Invalid workspace name'}), 400
            
        workspace_path = PROJECT_ROOT / "workspaces" / safe_workspace_name
        
        if not workspace_path.exists():
            return jsonify({'error': f'Workspace \'{safe_workspace_name}\' not found'}), 404
            
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        allowed_extensions = ['txt', 'md']
        if '.' in file.filename and file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
            return jsonify({'error': 'File type not allowed. Only .txt and .md files are supported.'}), 400
            
        if file:
            filename = file.filename
            file_path = workspace_path / filename
            file.save(file_path)
            logger.info(f"File '{filename}' uploaded successfully to '{safe_workspace_name}'")
            return jsonify({'message': f'File \'{filename}\' uploaded successfully to \'{safe_workspace_name}\''}), 201
            
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        return jsonify({'error': f'Failed to save file: {e}'}), 500

@app.route('/workspaces', methods=['GET'])
def list_workspaces():
    try:
        workspaces_dir = PROJECT_ROOT / "workspaces"
        if not workspaces_dir.exists():
            return jsonify([]), 200
        
        workspaces_list = [d.name for d in workspaces_dir.iterdir() if d.is_dir()]
        return jsonify(workspaces_list), 200
    
    except Exception as e:
        logger.error(f"Error listing workspaces: {e}")
        return jsonify({'error': f'Failed to list workspaces: {e}'}), 500

@app.route('/workspace_documents/<workspace_name>', methods=['GET'])
def get_workspace_documents(workspace_name):
    """Get list of documents in a workspace for AI linker dropdown"""
    try:
        workspace_path = ensure_workspace(workspace_name)
        documents = []
        
        for file in workspace_path.iterdir():
            if file.is_file() and file.suffix.lower() in [".txt", ".md"]:
                documents.append({
                    "id": file.stem,
                    "name": file.name,
                    "title": file.stem.replace("_", " ").title()
                })
        
        return jsonify({'documents': documents})
    
    except Exception as e:
        logger.error(f"Error getting workspace documents: {e}")
        return jsonify({'error': 'Failed to get workspace documents'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
