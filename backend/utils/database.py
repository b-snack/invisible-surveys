"""
Database module for Pulse Feedback - Using SQLite
"""
from backend.utils.sqlite_db import sqlite_db

class Database:
    """Database wrapper for SQLite"""
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
        return cls._instance
    
    @property
    def db(self):
        """Return the SQLite database instance"""
        return sqlite_db
    
    @property
    def sessions(self):
        """Sessions collection interface"""
        class SessionsCollection:
            @staticmethod
            def find(query=None, **kwargs):
                if query and 'session_id' in query:
                    session = sqlite_db.get_session(query['session_id'])
                    return [session] if session else []
                else:
                    limit = kwargs.get('limit', 100)
                    return sqlite_db.get_all_sessions(limit)
            
            @staticmethod
            def find_one(query):
                if query and 'session_id' in query:
                    return sqlite_db.get_session(query['session_id'])
                return None
            
            @staticmethod
            def insert_one(document):
                session_id = document.get('session_id')
                page_url = document.get('page_url', 'Unknown')
                if session_id:
                    return sqlite_db.create_session(session_id, page_url)
                return None
            
            @staticmethod
            def delete_one(query):
                if query and 'session_id' in query:
                    result = sqlite_db.delete_session(query['session_id'])
                    return type('Result', (), {'deleted_count': result['session_deleted']})()
                return type('Result', (), {'deleted_count': 0})()
            
            @staticmethod
            def count_documents(query):
                if query and 'session_id' in query:
                    session = sqlite_db.get_session(query['session_id'])
                    return 1 if session else 0
                return len(sqlite_db.get_all_sessions(1000))
        
        return SessionsCollection()
    
    @property
    def events(self):
        """Events collection interface"""
        class EventsCollection:
            @staticmethod
            def find(query=None, **kwargs):
                if query and 'session_id' in query:
                    session_id = query['session_id']
                    limit = kwargs.get('limit', 1000)
                    events = sqlite_db.get_events_by_session(session_id, limit)
                    
                    # Apply type filter if specified
                    if query.get('type'):
                        event_type = query['type']
                        events = [e for e in events if e['type'] == event_type]
                    
                    # Apply sorting
                    sort = kwargs.get('sort')
                    if sort:
                        field, direction = sort if isinstance(sort, tuple) else (sort, 1)
                        reverse = direction == -1
                        events.sort(key=lambda x: x.get(field, ''), reverse=reverse)
                    
                    return events
                return []
            
            @staticmethod
            def find_one(query):
                if query and 'session_id' in query:
                    events = sqlite_db.get_events_by_session(query['session_id'], 1)
                    return events[0] if events else None
                return None
            
            @staticmethod
            def insert_one(document):
                session_id = document.get('session_id')
                event_type = document.get('type')
                data = document.get('data', {})
                if session_id and event_type:
                    return sqlite_db.create_event(session_id, event_type, data)
                return None
            
            @staticmethod
            def delete_many(query):
                if query and 'session_id' in query:
                    deleted = sqlite_db.delete_events_by_session(query['session_id'])
                    return type('Result', (), {'deleted_count': deleted})()
                return type('Result', (), {'deleted_count': 0})()
            
            @staticmethod
            def count_documents(query):
                if query and 'session_id' in query:
                    events = sqlite_db.get_events_by_session(query['session_id'], 10000)
                    if query.get('type'):
                        event_type = query['type']
                        events = [e for e in events if e['type'] == event_type]
                    return len(events)
                return 0
        
        return EventsCollection()
    
    def close(self):
        """Close database connection (SQLite handles this automatically)"""
        pass

# Global database instance
db = Database()
