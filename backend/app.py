import os
from pathlib import Path
from transformers import pipeline
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS # Import CORS

# Get the absolute path of the project directory (adjust if backend is not directly in project root)
# Assuming backend is in the same directory as the frontend's project root
PROJECT_ROOT = Path(__file__).parent.parent.absolute()

# Load Hugging Face extractive QA model
# Initialize the pipeline globally to avoid re-loading on each request
try:
    qa_pipeline = pipeline("question-answering", model="deepset/roberta-base-squad2")
except Exception as e:
    print(f"Error loading QA pipeline: {e}")
    qa_pipeline = None # Handle case where pipeline loading fails

app = Flask(__name__)
CORS(app) # Enable CORS for all origins

# Create or get workspace directory
def ensure_workspace(workspace_name):
    # Sanitize workspace_name to prevent directory traversal
    safe_workspace_name = ''.join(c for c in workspace_name if c.isalnum() or c in ('-', '_')).rstrip()
    if not safe_workspace_name:
        raise ValueError("Invalid workspace name")
    path = PROJECT_ROOT / "workspaces" / safe_workspace_name
    path.mkdir(parents=True, exist_ok=True)
    return path

# Load all text from .txt and .md files in a workspace
def load_workspace_content(workspace_path):
    content = ""
    print(f"\n🔍 Scanning workspace: {workspace_path}\n")
    if not workspace_path.exists():
        print(f"⚠️ Workspace not found: {workspace_path}")
        return ""
        
    for file in workspace_path.iterdir():
        print(f"📄 Checking file: {file.name}")
        if file.is_file() and file.suffix.lower() in [".txt", ".md"]:
            try:
                with open(file, "r", encoding="utf-8") as f:
                    file_content = f.read()
                    print(f"✅ Loaded {file.name} ({len(file_content)} characters)")
                    content += file_content + "\n"
            except Exception as e:
                print(f"❌ Failed to read file {file.name}: {e}")
        else:
            print(f"⚠️ Ignored {file.name} (unsupported extension)")
    if not content:
        print("⚠️ No readable content found in workspace.")
    return content

# Split content into chunks for processing
def split_text(text, max_words=500):
    words = text.split()
    return [" ".join(words[i:i + max_words]) for i in range(0, len(words), max_words)]

# Answer the question using the workspace documents
def answer_question_from_workspace(workspace_name, question):
    try:
        workspace_path = ensure_workspace(workspace_name)
    except ValueError as e:
        return str(e)
        
    content = load_workspace_content(workspace_path)

    if not content.strip():
        return "Workspace has no content to search."
        
    if qa_pipeline is None:
        return "Question answering model not loaded. Please check backend logs."

    chunks = split_text(content)
    best_answer = {"score": 0, "answer": "No answer found in the provided documents."}

    for chunk in chunks:
        try:
            # Add a check for minimum context length if needed by the model
            if len(chunk.split()) < 10: # Example threshold, adjust as needed
                 continue
            result = qa_pipeline(question=question, context=chunk)
            if result["score"] > best_answer["score"]:
                best_answer = result
        except Exception as e:
            print(f"Error processing chunk: {e}")
            continue  # skip faulty chunks

    return best_answer["answer"]

@app.route('/')
def index():
    return "Flask backend for AI features is running!"

@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.json
    workspace_name = data.get('workspace')
    question = data.get('question')

    if not workspace_name or not question:
        return jsonify({'error': 'Missing workspace name or question'}), 400

    answer = answer_question_from_workspace(workspace_name, question)
    return jsonify({'answer': answer})

@app.route('/create_workspace', methods=['POST'])
def create_workspace():
    data = request.json
    workspace_name = data.get('workspace')
    
    if not workspace_name:
        return jsonify({'error': 'Missing workspace name'}), 400
        
    try:
        ensure_workspace(workspace_name)
        return jsonify({'message': f'Workspace \'{workspace_name}\' created successfully'}), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Failed to create workspace: {e}'}), 500

# Implement file upload endpoint
@app.route('/upload_file/<workspace_name>', methods=['POST'])
def upload_file(workspace_name):
    # Basic sanitation for workspace_name again, although ensure_workspace does it
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
        
    # Basic security check for allowed extensions (you might want a more comprehensive list)
    allowed_extensions = ['txt', 'md']
    if '.' in file.filename and file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({'error': 'File type not allowed'}), 400
        
    if file:
        # Securely save the file
        filename = file.filename # In a real app, use secure_filename
        file_path = workspace_path / filename
        try:
            file.save(file_path)
            return jsonify({'message': f'File \'{filename}\' uploaded successfully to \'{safe_workspace_name}\''}), 201
        except Exception as e:
            return jsonify({'error': f'Failed to save file: {e}'}), 500
            
    return jsonify({'error': 'Unknown error during file upload'}), 500

# Add endpoint to list workspaces
@app.route('/workspaces', methods=['GET'])
def list_workspaces():
    workspaces_dir = PROJECT_ROOT / "workspaces"
    if not workspaces_dir.exists():
        return jsonify([]), 200 # Return empty list if workspaces directory doesn't exist
    
    try:
        # List only directories within the workspaces folder
        workspaces_list = [d.name for d in workspaces_dir.iterdir() if d.is_dir()]
        return jsonify(workspaces_list), 200
    except Exception as e:
        return jsonify({'error': f'Failed to list workspaces: {e}'}), 500

if __name__ == '__main__':
    # Consider using a production-ready WSGI server like Gunicorn in production
    app.run(debug=True, port=5000) 