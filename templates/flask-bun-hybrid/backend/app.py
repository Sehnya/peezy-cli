from flask import Flask, render_template, jsonify, send_from_directory
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, 
           static_folder='../frontend/dist', 
           template_folder='templates')
CORS(app)

@app.route('/')
def home():
    """Serve the React app"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files from React build"""
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'app': '__APP_NAME__',
        'backend': 'Flask',
        'frontend': 'React + Bun'
    })

@app.route('/api/env')
def get_env():
    """Get environment configuration for frontend"""
    return jsonify({
        'app_name': '__APP_NAME__',
        'api_url': os.getenv('API_URL', 'http://localhost:5000'),
        # Add other non-sensitive env vars here
    })

@app.route('/api/data')
def get_data():
    """Sample API endpoint"""
    return jsonify({
        'message': 'Hello from Flask backend!',
        'data': [
            {'id': 1, 'name': 'Item 1', 'value': 100},
            {'id': 2, 'name': 'Item 2', 'value': 200},
            {'id': 3, 'name': 'Item 3', 'value': 300}
        ]
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )