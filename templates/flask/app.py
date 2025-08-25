from flask import Flask, render_template, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

@app.route('/')
def home():
    """Serve the main page"""
    return render_template('index.html', app_name='__APP_NAME__')

@app.route('/api/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'app': '__APP_NAME__',
        'version': '1.0.0'
    })

@app.route('/api/hello')
def hello():
    """Sample API endpoint"""
    return jsonify({
        'message': 'Hello from __APP_NAME__!',
        'timestamp': '2024-01-01T00:00:00Z'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )