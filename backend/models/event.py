from datetime import datetime

class Event:
    EVENT_TYPES = {
        'MOUSE_MOVE': 'mouse_move',
        'CLICK': 'click',
        'RAGE_CLICK': 'rage_click',
        'SCROLL': 'scroll',
        'NAVIGATION': 'navigation',
        'KEYBOARD': 'keyboard',
        'VISIBILITY': 'visibility'
    }
    
    @staticmethod
    def create_event(session_id, event_type, data):
        """Create a new event"""
        from backend.utils.database import db
        
        event_data = {
            "session_id": session_id,
            "type": event_type,
            "timestamp": datetime.utcnow(),
            "data": data
        }
        
        result = db.events.insert_one(event_data)
        return event_data
    
    @staticmethod
    def create_batch_events(events):
        """Create multiple events in batch"""
        from backend.utils.database import db
        
        if not events:
            return 0
        
        inserted_count = 0
        for event in events:
            if 'timestamp' not in event:
                event['timestamp'] = datetime.utcnow()
            
            result = db.events.insert_one(event)
            if result:
                inserted_count += 1
        
        return inserted_count
    
    @staticmethod
    def get_events_by_session(session_id, event_type=None, limit=1000):
        """Get all events for a session, optionally filtered by type"""
        from backend.utils.database import db
        
        query = {"session_id": session_id}
        if event_type:
            query["type"] = event_type
        
        events = db.events.find(query, limit=limit)
        # Sort by timestamp ascending (oldest first)
        events_list = list(events) if events else []
        events_list.sort(key=lambda x: x.get('timestamp', ''))
        return events_list
    
    @staticmethod
    def get_heatmap_data(session_id):
        """Get mouse movement and click data for heatmap visualization"""
        from backend.utils.database import db
        
        # Get mouse movements
        mouse_events = db.events.find({
            "session_id": session_id,
            "type": "mouse_move"
        }, limit=1000)
        
        # Get clicks (normal and rage)
        click_events = db.events.find({
            "session_id": session_id,
            "type": {"$in": ["click", "rage_click"]}
        }, limit=1000)
        
        # Convert to lists
        mouse_list = list(mouse_events) if mouse_events else []
        click_list = list(click_events) if click_events else []
        
        # Sort by timestamp
        mouse_list.sort(key=lambda x: x.get('timestamp', ''))
        click_list.sort(key=lambda x: x.get('timestamp', ''))
        
        return {
            "mouse_movements": mouse_list,
            "clicks": click_list
        }
    
    @staticmethod
    def get_session_metrics(session_id):
        """Get aggregated metrics for a session"""
        from backend.utils.database import db
        
        # Get all events for the session
        events = db.events.find({"session_id": session_id}, limit=10000)
        events_list = list(events) if events else []
        
        metrics = {
            "total_clicks": 0,
            "rage_clicks": 0,
            "mouse_movements": 0,
            "scroll_events": 0,
            "keyboard_events": 0,
            "navigation_events": 0,
            "visibility_events": 0
        }
        
        for event in events_list:
            event_type = event.get('type', '')
            
            if event_type == "click":
                metrics["total_clicks"] += 1
            elif event_type == "rage_click":
                metrics["rage_clicks"] += 1
            elif event_type == "mouse_move":
                metrics["mouse_movements"] += 1
            elif event_type == "scroll":
                metrics["scroll_events"] += 1
            elif event_type == "keyboard":
                metrics["keyboard_events"] += 1
            elif event_type == "navigation":
                metrics["navigation_events"] += 1
            elif event_type == "visibility":
                metrics["visibility_events"] += 1
        
        return metrics
