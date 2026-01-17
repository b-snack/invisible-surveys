import uuid
from datetime import datetime

class Session:
    @staticmethod
    def create_session(page_url):
        """Create a new session"""
        from backend.utils.database import db
        
        session_id = str(uuid.uuid4())
        session_data = {
            "session_id": session_id,
            "started_at": datetime.utcnow(),
            "page_url": page_url,
            "created_at": datetime.utcnow()
        }
        
        result = db.sessions.insert_one(session_data)
        return session_data
    
    @staticmethod
    def get_session(session_id):
        """Get a session by ID"""
        from backend.utils.database import db
        
        return db.sessions.find_one({"session_id": session_id})
    
    @staticmethod
    def get_all_sessions(limit=100):
        """Get all sessions, most recent first"""
        from backend.utils.database import db
        
        sessions = db.sessions.find(limit=limit)
        # Convert to list and ensure proper datetime format
        sessions_list = []
        for session in sessions:
            if session:
                sessions_list.append(session)
        return sessions_list
    
    @staticmethod
    def delete_session(session_id):
        """Delete a session and all its events"""
        from backend.utils.database import db
        
        # Delete session (events will be deleted automatically via CASCADE in SQLite)
        session_result = db.sessions.delete_one({"session_id": session_id})
        
        return {
            "session_deleted": session_result.deleted_count,
            "events_deleted": 0  # Will be handled by SQLite CASCADE
        }
