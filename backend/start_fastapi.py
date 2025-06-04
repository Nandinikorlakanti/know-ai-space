
import uvicorn
from fastapi_app import app

if __name__ == "__main__":
    print("Starting FastAPI server on http://localhost:8000")
    uvicorn.run(app, host="localhost", port=8000, reload=True)
