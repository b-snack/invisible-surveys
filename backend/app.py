from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import blueprints
from backend.routes.sessions import sessions_bp
from backend.routes.events import events_bp
from backend.routes.analytics import analytics_bp

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Configure CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:3000", "http://127.0.0.1:8080"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Register blueprints
    app.register_blueprint(sessions_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(analytics_bp)
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {
            'status': 'healthy',
            'service': 'pulse-feedback-backend',
            'version': '1.0.0'
        }
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {
            'success': False,
            'error': 'Resource not found'
        }, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {
            'success': False,
            'error': 'Internal server error'
        }, 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    # Get port from environment or default to 5001
    port = int(os.getenv('PORT', 5001))
    
    print(f"Starting Pulse Feedback Backend on port {port}")
    print(f"MongoDB URI: {os.getenv('MONGODB_URI', 'Not set')[:50]}...")
    print(f"Gemini API Key: {'Set' if os.getenv('GEMINI_API_KEY') else 'Not set'}")
    
    app.run(host='0.0.0.0', port=port, debug=True)
