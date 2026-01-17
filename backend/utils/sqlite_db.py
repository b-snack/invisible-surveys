"""
SQLite database implementation for Pulse Feedback
"""
import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
import os

class SQLiteDatabase:
    def __init__(self, db_path="pulse_feedback.db"):
        self.db_path = db_path
        self._init_db()
    
    def _get_connection(self):
        """Get a database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Return rows as dictionaries
        return conn
    
    def _init_db(self):
        """Initialize database tables"""
        with self._get_connection() as conn:
            # Create sessions table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT UNIQUE NOT NULL,
                    started_at TIMESTAMP NOT NULL,
                    page_url TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create events table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    type TEXT NOT NULL,
                    timestamp TIMESTAMP NOT NULL,
                    data TEXT NOT NULL,
                    FOREIGN KEY (session_id) REFERENCES sessions (session_id) ON DELETE CASCADE
                )
            ''')
            
            # Create indexes for better performance
            conn.execute('CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at)')
            
            conn.commit()
    
    # Session operations
    def create_session(self, session_id: str, page_url: str) -> Dict[str, Any]:
        """Create a new session"""
        with self._get_connection() as conn:
            started_at = datetime.utcnow().isoformat()
            conn.execute(
                'INSERT INTO sessions (session_id, started_at, page_url) VALUES (?, ?, ?)',
                (session_id, started_at, page_url)
            )
            conn.commit()
            
            return {
                'session_id': session_id,
                'started_at': started_at,
                'page_url': page_url
            }
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get a session by ID"""
        with self._get_connection() as conn:
            cursor = conn.execute(
                'SELECT * FROM sessions WHERE session_id = ?',
                (session_id,)
            )
            row = cursor.fetchone()
            return dict(row) if row else None
    
    def get_all_sessions(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all sessions, most recent first"""
        with self._get_connection() as conn:
            cursor = conn.execute(
                'SELECT * FROM sessions ORDER BY started_at DESC LIMIT ?',
                (limit,)
            )
            sessions = []
            for row in cursor.fetchall():
                session = dict(row)
                # Add '_id' field for compatibility with MongoDB-style code
                session['_id'] = str(session.get('id', ''))
                sessions.append(session)
            return sessions
    
    def delete_session(self, session_id: str) -> Dict[str, int]:
        """Delete a session and all its events"""
        with self._get_connection() as conn:
            # Get count of events to be deleted
            cursor = conn.execute(
                'SELECT COUNT(*) as count FROM events WHERE session_id = ?',
                (session_id,)
            )
            events_deleted = cursor.fetchone()['count']
            
            # Delete session (events will be deleted due to CASCADE)
            conn.execute('DELETE FROM sessions WHERE session_id = ?', (session_id,))
            conn.commit()
            
            return {
                "session_deleted": 1 if conn.total_changes > 0 else 0,
                "events_deleted": events_deleted
            }
    
    # Event operations
    def create_event(self, session_id: str, event_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new event"""
        with self._get_connection() as conn:
            timestamp = datetime.utcnow().isoformat()
            data_json = json.dumps(data)
            
            conn.execute(
                'INSERT INTO events (session_id, type, timestamp, data) VALUES (?, ?, ?, ?)',
                (session_id, event_type, timestamp, data_json)
            )
            conn.commit()
            
            return {
                'session_id': session_id,
                'type': event_type,
                'timestamp': timestamp,
                'data': data
            }
    
    def get_events_by_session(self, session_id: str, limit: int = 1000) -> List[Dict[str, Any]]:
        """Get all events for a session"""
        with self._get_connection() as conn:
            cursor = conn.execute(
                '''SELECT * FROM events 
                   WHERE session_id = ? 
                   ORDER BY timestamp DESC 
                   LIMIT ?''',
                (session_id, limit)
            )
            
            events = []
            for row in cursor.fetchall():
                event = dict(row)
                event['data'] = json.loads(event['data'])  # Parse JSON data
                # Add '_id' field for compatibility with MongoDB-style code
                event['_id'] = str(event.get('id', ''))
                events.append(event)
            
            return events
    
    def get_events_by_type(self, session_id: str, event_type: str, limit: int = 1000) -> List[Dict[str, Any]]:
        """Get events of a specific type for a session"""
        with self._get_connection() as conn:
            cursor = conn.execute(
                '''SELECT * FROM events 
                   WHERE session_id = ? AND type = ?
                   ORDER BY timestamp DESC 
                   LIMIT ?''',
                (session_id, event_type, limit)
            )
            
            events = []
            for row in cursor.fetchall():
                event = dict(row)
                event['data'] = json.loads(event['data'])  # Parse JSON data
                events.append(event)
            
            return events
    
    def get_event_counts_by_session(self, session_id: str) -> Dict[str, int]:
        """Get counts of different event types for a session"""
        with self._get_connection() as conn:
            cursor = conn.execute(
                '''SELECT type, COUNT(*) as count 
                   FROM events 
                   WHERE session_id = ? 
                   GROUP BY type''',
                (session_id,)
            )
            
            counts = {}
            for row in cursor.fetchall():
                counts[row['type']] = row['count']
            
            return counts
    
    def get_all_events(self, limit: int = 10000) -> List[Dict[str, Any]]:
        """Get all events across all sessions"""
        with self._get_connection() as conn:
            cursor = conn.execute(
                '''SELECT * FROM events 
                   ORDER BY timestamp DESC 
                   LIMIT ?''',
                (limit,)
            )
            
            events = []
            for row in cursor.fetchall():
                event = dict(row)
                event['data'] = json.loads(event['data'])  # Parse JSON data
                events.append(event)
            
            return events
    
    def delete_events_by_session(self, session_id: str) -> int:
        """Delete all events for a session"""
        with self._get_connection() as conn:
            cursor = conn.execute(
                'DELETE FROM events WHERE session_id = ?',
                (session_id,)
            )
            conn.commit()
            return cursor.rowcount
    
    # Analytics operations
    def get_session_metrics(self, session_id: str) -> Dict[str, Any]:
        """Get metrics for a session"""
        with self._get_connection() as conn:
            # Get total events
            cursor = conn.execute(
                'SELECT COUNT(*) as total FROM events WHERE session_id = ?',
                (session_id,)
            )
            total_events = cursor.fetchone()['total']
            
            # Get event type counts
            cursor = conn.execute(
                '''SELECT type, COUNT(*) as count 
                   FROM events 
                   WHERE session_id = ? 
                   GROUP BY type''',
                (session_id,)
            )
            
            type_counts = {}
            for row in cursor.fetchall():
                type_counts[row['type']] = row['count']
            
            # Get session duration (time between first and last event)
            cursor = conn.execute(
                '''SELECT MIN(timestamp) as first, MAX(timestamp) as last 
                   FROM events 
                   WHERE session_id = ?''',
                (session_id,)
            )
            time_row = cursor.fetchone()
            
            duration = None
            if time_row['first'] and time_row['last']:
                first = datetime.fromisoformat(time_row['first'])
                last = datetime.fromisoformat(time_row['last'])
                duration = (last - first).total_seconds()
            
            return {
                'total_events': total_events,
                'type_counts': type_counts,
                'duration_seconds': duration,
                'session_id': session_id
            }
    
    def get_heatmap_data(self, session_id: str) -> Dict[str, List]:
        """Get heatmap data for a session (clicks and mouse movements)"""
        with self._get_connection() as conn:
            # Get click events
            cursor = conn.execute(
                '''SELECT data FROM events 
                   WHERE session_id = ? AND type IN ('click', 'rage_click')''',
                (session_id,)
            )
            
            clicks = []
            for row in cursor.fetchall():
                data = json.loads(row['data'])
                if 'x' in data and 'y' in data:
                    clicks.append({
                        'x': data['x'],
                        'y': data['y'],
                        'type': 'rage_click' if data.get('is_rage_click', False) else 'click'
                    })
            
            # Get mouse movement events (sampled)
            cursor = conn.execute(
                '''SELECT data FROM events 
                   WHERE session_id = ? AND type = 'mouse_move' 
                   ORDER BY timestamp''',
                (session_id,)
            )
            
            mouse_movements = []
            for i, row in enumerate(cursor.fetchall()):
                # Sample every 10th movement to reduce data size
                if i % 10 == 0:
                    data = json.loads(row['data'])
                    if 'x' in data and 'y' in data:
                        mouse_movements.append({
                            'x': data['x'],
                            'y': data['y']
                        })
            
            return {
                'clicks': clicks,
                'mouse_movements': mouse_movements
            }

# Global SQLite database instance
sqlite_db = SQLiteDatabase()
