from datetime import datetime, timedelta
from collections import defaultdict

class EventProcessor:
    @staticmethod
    def detect_rage_clicks(click_events):
        """
        Detect rage clicks from click events.
        Rage click = 3+ clicks within 1 second in 50px radius.
        
        Args:
            click_events: List of click events with x, y, timestamp
            
        Returns:
            List of indices that are rage clicks
        """
        if len(click_events) < 3:
            return []
        
        # Sort by timestamp
        sorted_clicks = sorted(click_events, key=lambda x: x['timestamp'])
        
        rage_click_indices = []
        
        for i in range(len(sorted_clicks) - 2):
            # Check if this click and next 2 are within 1 second
            time_window = sorted_clicks[i + 2]['timestamp'] - sorted_clicks[i]['timestamp']
            
            if time_window.total_seconds() <= 1.0:
                # Check if all 3 clicks are within 50px radius
                x_coords = [click['x'] for click in sorted_clicks[i:i+3]]
                y_coords = [click['y'] for click in sorted_clicks[i:i+3]]
                
                # Calculate centroid
                centroid_x = sum(x_coords) / 3
                centroid_y = sum(y_coords) / 3
                
                # Check if all points are within 50px of centroid
                max_distance = 0
                for j in range(3):
                    distance = ((x_coords[j] - centroid_x) ** 2 + (y_coords[j] - centroid_y) ** 2) ** 0.5
                    max_distance = max(max_distance, distance)
                
                if max_distance <= 50:
                    rage_click_indices.extend([i, i+1, i+2])
        
        # Remove duplicates and return
        return list(set(rage_click_indices))
    
    @staticmethod
    def process_batch_events(events):
        """
        Process a batch of events to detect rage clicks and add metadata.
        
        Args:
            events: List of raw events from frontend
            
        Returns:
            Processed events ready for storage
        """
        if not events:
            return []
        
        # Separate clicks for rage detection
        click_events = []
        click_indices = []
        
        for i, event in enumerate(events):
            if event.get('type') == 'click':
                if 'x' in event.get('data', {}) and 'y' in event.get('data', {}):
                    click_events.append({
                        'x': event['data']['x'],
                        'y': event['data']['y'],
                        'timestamp': event.get('timestamp', datetime.utcnow()),
                        'original_index': i
                    })
                click_indices.append(i)
        
        # Detect rage clicks
        if len(click_events) >= 3:
            rage_indices = EventProcessor.detect_rage_clicks(click_events)
            
            # Mark rage clicks in original events
            for rage_idx in rage_indices:
                original_idx = click_events[rage_idx]['original_index']
                events[original_idx]['type'] = 'rage_click'
                events[original_idx]['data']['is_rage_click'] = True
        
        return events
    
    @staticmethod
    def calculate_mouse_speed(mouse_events):
        """
        Calculate average mouse speed from movement events.
        
        Args:
            mouse_events: List of mouse movement events with x, y, timestamp
            
        Returns:
            Average speed in pixels per second
        """
        if len(mouse_events) < 2:
            return 0
        
        total_distance = 0
        total_time = 0
        
        for i in range(1, len(mouse_events)):
            prev = mouse_events[i-1]
            curr = mouse_events[i]
            
            # Calculate distance
            distance = ((curr['x'] - prev['x']) ** 2 + (curr['y'] - prev['y']) ** 2) ** 0.5
            
            # Calculate time difference in seconds
            time_diff = (curr['timestamp'] - prev['timestamp']).total_seconds()
            
            if time_diff > 0:
                total_distance += distance
                total_time += time_diff
        
        if total_time == 0:
            return 0
        
        return total_distance / total_time
    
    @staticmethod
    def analyze_click_patterns(click_events):
        """
        Analyze click patterns for UX insights.
        
        Args:
            click_events: List of click events
            
        Returns:
            Dictionary with analysis results
        """
        if not click_events:
            return {
                'total_clicks': 0,
                'rage_click_percentage': 0,
                'click_density_areas': [],
                'average_clicks_per_minute': 0
            }
        
        total_clicks = len(click_events)
        rage_clicks = sum(1 for click in click_events if click.get('type') == 'rage_click')
        
        # Calculate click density using grid
        grid_size = 100  # 100px grid
        grid_counts = defaultdict(int)
        
        for click in click_events:
            if 'x' in click and 'y' in click:
                grid_x = int(click['x'] / grid_size)
                grid_y = int(click['y'] / grid_size)
                grid_counts[(grid_x, grid_y)] += 1
        
        # Find high density areas (more than 2 clicks)
        density_areas = []
        for (grid_x, grid_y), count in grid_counts.items():
            if count > 2:
                density_areas.append({
                    'x': grid_x * grid_size,
                    'y': grid_y * grid_size,
                    'width': grid_size,
                    'height': grid_size,
                    'click_count': count
                })
        
        # Calculate clicks per minute if we have timestamps
        if all('timestamp' in click for click in click_events):
            timestamps = [click['timestamp'] for click in click_events]
            time_range = max(timestamps) - min(timestamps)
            minutes = time_range.total_seconds() / 60
            clicks_per_minute = total_clicks / minutes if minutes > 0 else 0
        else:
            clicks_per_minute = 0
        
        return {
            'total_clicks': total_clicks,
            'rage_clicks': rage_clicks,
            'rage_click_percentage': (rage_clicks / total_clicks * 100) if total_clicks > 0 else 0,
            'click_density_areas': density_areas,
            'average_clicks_per_minute': clicks_per_minute
        }
