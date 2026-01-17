from flask import Blueprint, request, jsonify
from backend.models.session import Session
from backend.models.event import Event

sessions_bp = Blueprint('sessions', __name__)

@sessions_bp.route('/api/session', methods=['POST'])
def create_session():
    """Create a new tracking session"""
    try:
        data = request.get_json()
        page_url = data.get('page_url', request.headers.get('Referer', 'Unknown'))
        
        session = Session.create_session(page_url)
        
        return jsonify({
            'success': True,
            'session_id': session['session_id'],
            'started_at': session['started_at'].isoformat() if hasattr(session['started_at'], 'isoformat') else str(session['started_at'])
        }), 201
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@sessions_bp.route('/api/sessions', methods=['GET'])
def get_sessions():
    """Get all sessions"""
    try:
        limit = request.args.get('limit', default=100, type=int)
        sessions = Session.get_all_sessions(limit)
        
        # Convert ObjectId and datetime to strings
        for session in sessions:
            session['_id'] = str(session['_id'])
            if hasattr(session['started_at'], 'isoformat'):
                session['started_at'] = session['started_at'].isoformat()
            if hasattr(session.get('created_at'), 'isoformat'):
                session['created_at'] = session['created_at'].isoformat()
        
        return jsonify({
            'success': True,
            'sessions': sessions,
            'count': len(sessions)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@sessions_bp.route('/api/sessions/<session_id>', methods=['DELETE'])
def delete_session(session_id):
    """Delete a session and all its events"""
    try:
        result = Session.delete_session(session_id)
        
        return jsonify({
            'success': True,
            'message': f"Deleted session {session_id}",
            'result': result
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
