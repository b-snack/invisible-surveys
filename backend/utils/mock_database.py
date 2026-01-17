"""
Mock database for demo purposes when MongoDB is not available
"""
from datetime import datetime, timedelta
import random

class MockDatabase:
    def __init__(self):
        self.sessions = []
        self.events = []
        self._init_mock_data()
    
    def _init_mock_data(self):
        """Initialize with some mock data for demo"""
        # Create some mock sessions
        for i in range(5):
            session_id = f"session_{i+1}_{random.randint(1000, 9999)}"
            self.sessions.append({
                "_id": f"mock_id_{i}",
                "session_id": session_id,
                "started_at": datetime.utcnow() - timedelta(hours=random.randint(1, 24)),
                "page_url": f"http://localhost:8080/product/{i+1}",
                "created_at": datetime.utcnow() - timedelta(hours=random.randint(1, 24))
            })
            
            # Create mock events for each session
            event_types = ['mouse_move', 'click', 'rage_click', 'scroll', 'navigation', 'keyboard']
            for j in range(random.randint(10, 50)):
                event_type = random.choice(event_types)
                self.events.append({
                    "_id": f"event_{i}_{j}",
                    "session_id": session_id,
                    "type": event_type,
                    "timestamp": datetime.utcnow() - timedelta(minutes=random.randint(1, 60)),
                    "data": self._create_mock_event_data(event_type)
                })
    
    def _create_mock_event_data(self, event_type):
        """Create mock event data based on type"""
        if event_type == 'mouse_move':
            return {
                "x": random.randint(0, 1920),
                "y": random.randint(0, 1080),
                "viewport_width": 1920,
                "viewport_height": 1080
            }
        elif event_type in ['click', 'rage_click']:
            return {
                "x": random.randint(100, 1800),
                "y": random.randint(100, 900),
                "element": random.choice(['button.add-to-cart', 'a.product-link', 'div.product-image', 'button.checkout']),
                "viewport_width": 1920,
                "viewport_height": 1080,
                "is_rage_click": event_type == 'rage_click'
            }
        elif event_type == 'scroll':
            return {
                "percentage": random.randint(0, 100),
                "direction": random.choice(['up', 'down']),
                "position": random.randint(0, 5000)
            }
        elif event_type == 'navigation':
            return {
                "url": random.choice([
                    "http://localhost:8080/",
                    "http://localhost:8080/products",
                    "http://localhost:8080/cart",
                    "http://localhost:8080/checkout"
                ]),
                "referrer": "http://localhost:8080/",
                "timestamp": datetime.utcnow().isoformat()
            }
        elif event_type == 'keyboard':
            return {
                "key_code": random.choice([13, 32, 9, 27]),  # Enter, Space, Tab, Escape
                "timestamp": datetime.utcnow().isoformat(),
                "is_modifier": random.choice([True, False])
            }
        else:
            return {}
    
    def find(self, collection, query=None):
        """Mock find operation"""
        if collection == 'sessions':
            data = self.sessions
        elif collection == 'events':
            data = self.events
        else:
            return []
        
        if query:
            # Simple mock filtering
            filtered = []
            for item in data:
                match = True
                for key, value in query.items():
                    if key in item and item[key] != value:
                        match = False
                        break
                if match:
                    filtered.append(item)
            return filtered
        return data
    
    def find_one(self, collection, query):
        """Mock find_one operation"""
        results = self.find(collection, query)
        return results[0] if results else None
    
    def insert_one(self, collection, document):
        """Mock insert_one operation"""
        if collection == 'sessions':
            self.sessions.append(document)
        elif collection == 'events':
            self.events.append(document)
        return type('Result', (), {'inserted_id': f"mock_id_{len(self.events)}"})()
    
    def delete_one(self, collection, query):
        """Mock delete_one operation"""
        if collection == 'sessions':
            for i, session in enumerate(self.sessions):
                match = True
                for key, value in query.items():
                    if key in session and session[key] != value:
                        match = False
                        break
                if match:
                    del self.sessions[i]
                    return type('Result', (), {'deleted_count': 1})()
        return type('Result', (), {'deleted_count': 0})()
    
    def delete_many(self, collection, query):
        """Mock delete_many operation"""
        deleted = 0
        if collection == 'events':
            for i in range(len(self.events) - 1, -1, -1):
                match = True
                for key, value in query.items():
                    if key in self.events[i] and self.events[i][key] != value:
                        match = False
                        break
                if match:
                    del self.events[i]
                    deleted += 1
        return type('Result', (), {'deleted_count': deleted})()
    
    def count_documents(self, collection, query):
        """Mock count_documents operation"""
        return len(self.find(collection, query))

# Global mock database instance
mock_db = MockDatabase()
