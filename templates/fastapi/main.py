from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="__APP_NAME__",
    description="A FastAPI application scaffolded with peezy",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve a simple HTML page"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>__APP_NAME__</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0; padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh; display: flex; align-items: center; justify-content: center;
            }
            .container { 
                background: white; padding: 3rem; border-radius: 12px; 
                box-shadow: 0 10px 30px rgba(0,0,0,0.1); text-align: center; max-width: 600px;
            }
            h1 { color: #2c3e50; margin-bottom: 1rem; }
            p { color: #7f8c8d; margin-bottom: 2rem; }
            .links { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
            a { 
                background: #3498db; color: white; padding: 0.75rem 1.5rem; 
                text-decoration: none; border-radius: 6px; transition: background 0.2s;
            }
            a:hover { background: #2980b9; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>__APP_NAME__</h1>
            <p>🚀 Your FastAPI application is running!</p>
            <div class="links">
                <a href="/docs">API Documentation</a>
                <a href="/redoc">ReDoc</a>
                <a href="/api/health">Health Check</a>
            </div>
        </div>
    </body>
    </html>
    """

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": "__APP_NAME__",
        "version": "1.0.0"
    }

@app.get("/api/hello")
async def hello():
    """Sample API endpoint"""
    return {
        "message": "Hello from __APP_NAME__!",
        "framework": "FastAPI"
    }

@app.get("/api/items/{item_id}")
async def read_item(item_id: int, q: str = None):
    """Sample parameterized endpoint"""
    return {
        "item_id": item_id,
        "query": q,
        "app": "__APP_NAME__"
    }

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )