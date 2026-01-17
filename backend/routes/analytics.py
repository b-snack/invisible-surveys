from flask import Blueprint, request, jsonify
from backend.models.session import Session
from backend.models.event import Event
from backend.utils.gemini_analysis import GeminiAnalyzer
from datetime import datetime

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/api/analyze/<session_id>', methods=['POST'])
def analyze_session(session_id):
    """Use Gemini AI to analyze user behavior and generate UX recommendations"""
    try:
        # Get session data
        session_data = Session.get_session(session_id)
        if not session_data:
            return jsonify({
                'success': False,
                'error': f'Session {session_id} not found'
            }), 404
        
        # Get all events for the session
        events = Event.get_events_by_session(session_id)
        
        # Calculate session duration
        if events:
            # Convert string timestamps to datetime objects
            def parse_timestamp(ts):
                if isinstance(ts, str):
                    try:
                        return datetime.fromisoformat(ts.replace('Z', '+00:00'))
                    except:
                        return datetime.utcnow()
                return ts
            
            timestamps = [parse_timestamp(e['timestamp']) for e in events]
            session_duration = max(timestamps) - min(timestamps)
            session_duration_minutes = session_duration.total_seconds() / 60
        else:
            session_duration_minutes = 0
        
        # Get metrics
        metrics = Event.get_session_metrics(session_id)
        
        # Get heatmap data
        heatmap_data = Event.get_heatmap_data(session_id)
        
        # Prepare data for analysis
        events_data = {
            'metrics': metrics,
            'heatmap_data': heatmap_data,
            'session_duration_minutes': session_duration_minutes,
            'total_events': len(events)
        }
        
        # Convert datetime objects to strings for JSON serialization
        if hasattr(session_data['started_at'], 'isoformat'):
            session_data['started_at'] = session_data['started_at'].isoformat()
        
        # Use Gemini AI for analysis
        analyzer = GeminiAnalyzer()
        analysis = analyzer.analyze_session_behavior(session_data, events_data)
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'analysis': analysis,
            'metrics': metrics,
            'session_duration_minutes': session_duration_minutes
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@analytics_bp.route('/api/metrics/<session_id>', methods=['GET'])
def get_session_metrics(session_id):
    """Get aggregated metrics for a session"""
    try:
        metrics = Event.get_session_metrics(session_id)
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'metrics': metrics
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@analytics_bp.route('/api/summary', methods=['GET'])
def get_system_summary():
    """Get overall system summary"""
    try:
        from backend.utils.database import db
        
        # Get total sessions
        total_sessions = db.sessions.count_documents({})
        
        # Get total events
        total_events = db.events.count_documents({})
        
        # Get events by type
        pipeline = [
            {"$group": {
                "_id": "$type",
                "count": {"$sum": 1}
            }}
        ]
        
        events_by_type = list(db.events.aggregate(pipeline))
        
        # Get recent sessions
        recent_sessions = list(db.sessions.find().sort("started_at", -1).limit(5))
        for session in recent_sessions:
            session['_id'] = str(session['_id'])
            if hasattr(session['started_at'], 'isoformat'):
                session['started_at'] = session['started_at'].isoformat()
        
        return jsonify({
            'success': True,
            'summary': {
                'total_sessions': total_sessions,
                'total_events': total_events,
                'events_by_type': events_by_type,
                'recent_sessions': recent_sessions
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
