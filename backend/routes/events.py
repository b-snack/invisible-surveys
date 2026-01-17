from flask import Blueprint, request, jsonify
from backend.models.event import Event
from backend.utils.event_processor import EventProcessor

events_bp = Blueprint('events', __name__)

@events_bp.route('/api/track', methods=['POST'])
def track_events():
    """Receive tracking events in batch"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        session_id = data.get('session_id')
        events = data.get('events', [])
        
        if not session_id:
            return jsonify({
                'success': False,
                'error': 'session_id is required'
            }), 400
        
        if not events:
            return jsonify({
                'success': True,
                'message': 'No events to process',
                'count': 0
            }), 200
        
        # Add session_id to each event
        for event in events:
            event['session_id'] = session_id
        
        # Process events (detect rage clicks, etc.)
        processed_events = EventProcessor.process_batch_events(events)
        
        # Store events in database
        count = Event.create_batch_events(processed_events)
        
        return jsonify({
            'success': True,
            'message': f'Processed {count} events',
            'count': count
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@events_bp.route('/api/analytics/<session_id>', methods=['GET'])
def get_session_analytics(session_id):
    """Get all events for a session"""
    try:
        event_type = request.args.get('type')
        limit = request.args.get('limit', default=1000, type=int)
        
        events = Event.get_events_by_session(session_id, event_type, limit)
        
        # Convert ObjectId and datetime to strings
        for event in events:
            event['_id'] = str(event['_id'])
            if hasattr(event['timestamp'], 'isoformat'):
                event['timestamp'] = event['timestamp'].isoformat()
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'events': events,
            'count': len(events)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@events_bp.route('/api/heatmap/<session_id>', methods=['GET'])
def get_heatmap_data(session_id):
    """Get click and mouse movement data for heatmap"""
    try:
        heatmap_data = Event.get_heatmap_data(session_id)
        
        # Convert ObjectId and datetime to strings
        for event in heatmap_data['mouse_movements']:
            event['_id'] = str(event['_id'])
            if hasattr(event['timestamp'], 'isoformat'):
                event['timestamp'] = event['timestamp'].isoformat()
        
        for event in heatmap_data['clicks']:
            event['_id'] = str(event['_id'])
            if hasattr(event['timestamp'], 'isoformat'):
                event['timestamp'] = event['timestamp'].isoformat()
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'heatmap_data': heatmap_data
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
