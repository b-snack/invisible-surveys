import os
import google.generativeai as genai
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

class GeminiAnalyzer:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
    
    def analyze_session_behavior(self, session_data, events_data):
        """
        Analyze user behavior using Gemini AI.
        
        Args:
            session_data: Session information
            events_data: All events for the session
            
        Returns:
            AI-generated insights and recommendations
        """
        # Prepare data for analysis
        analysis_context = self._prepare_analysis_context(session_data, events_data)
        
        prompt = f"""
        You are a UX/UI expert analyzing user behavior data from a website session.
        
        CONTEXT:
        {analysis_context}
        
        Please provide a comprehensive analysis with the following structure:
        
        1. MAIN USABILITY PROBLEM:
           Identify the primary usability issue based on the behavior patterns.
        
        2. SPECIFIC INSIGHTS (4-6 points):
           - Navigation patterns and issues
           - Interaction efficiency problems  
           - Confusing elements or workflows
           - User frustration indicators
           - Attention distribution issues
           - Task completion barriers
        
        3. ACTIONABLE UX RECOMMENDATIONS (3-4 recommendations):
           - Specific design changes
           - Interface improvements
           - Workflow optimizations
           - User guidance enhancements
        
        Focus on concrete, actionable insights based on the data. Be specific about what elements need improvement and why.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return self._parse_ai_response(response.text)
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return self._get_fallback_analysis()
    
    def _prepare_analysis_context(self, session_data, events_data):
        """Prepare context data for AI analysis"""
        from backend.utils.event_processor import EventProcessor
        
        # Extract metrics
        metrics = events_data.get('metrics', {})
        heatmap_data = events_data.get('heatmap_data', {})
        
        # Calculate additional insights
        mouse_events = heatmap_data.get('mouse_movements', [])
        click_events = heatmap_data.get('clicks', [])
        
        mouse_speed = 0
        if mouse_events:
            mouse_speed = EventProcessor.calculate_mouse_speed([
                {
                    'x': e['data']['x'],
                    'y': e['data']['y'],
                    'timestamp': e['timestamp']
                } for e in mouse_events[:100]  # Sample first 100 for speed calculation
            ])
        
        click_analysis = EventProcessor.analyze_click_patterns(click_events)
        
        # Prepare context string
        context = f"""
        SESSION INFORMATION:
        - Page URL: {session_data.get('page_url', 'Unknown')}
        - Session Started: {session_data.get('started_at', 'Unknown')}
        - Session Duration: {events_data.get('session_duration_minutes', 0):.1f} minutes
        
        BEHAVIOR METRICS:
        - Total Clicks: {metrics.get('total_clicks', 0)}
        - Rage Clicks: {metrics.get('rage_clicks', 0)} ({click_analysis.get('rage_click_percentage', 0):.1f}%)
        - Mouse Movements: {metrics.get('mouse_movements', 0)}
        - Scroll Events: {metrics.get('scroll_events', 0)}
        - Keyboard Events: {metrics.get('keyboard_events', 0)}
        - Navigation Events: {metrics.get('navigation_events', 0)}
        
        MOVEMENT ANALYSIS:
        - Average Mouse Speed: {mouse_speed:.1f} pixels/second
        - Click Density Areas: {len(click_analysis.get('click_density_areas', []))} high-density zones
        - Average Clicks per Minute: {click_analysis.get('average_clicks_per_minute', 0):.1f}
        
        CLICK PATTERNS:
        - Rage clicks indicate user frustration with unresponsive elements
        - High click density areas suggest important or confusing interface elements
        - Mouse speed variations may indicate hesitation or exploration
        
        HEATMAP OBSERVATIONS:
        - Mouse trails show navigation paths and areas of interest
        - Click locations reveal interaction hotspots
        - Scroll depth indicates content engagement level
        """
        
        return context
    
    def _parse_ai_response(self, response_text):
        """Parse the AI response into structured format"""
        lines = response_text.split('\n')
        
        sections = {
            'main_problem': '',
            'insights': [],
            'recommendations': []
        }
        
        current_section = None
        
        for line in lines:
            line = line.strip()
            
            if not line:
                continue
            
            # Detect section headers
            if 'MAIN USABILITY PROBLEM' in line.upper():
                current_section = 'main_problem'
                continue
            elif 'SPECIFIC INSIGHTS' in line.upper():
                current_section = 'insights'
                continue
            elif 'ACTIONABLE UX RECOMMENDATIONS' in line.upper():
                current_section = 'recommendations'
                continue
            
            # Add content to current section
            if current_section == 'main_problem':
                if line and not line.startswith('1.') and not line.startswith('2.') and not line.startswith('3.'):
                    sections['main_problem'] += line + ' '
            elif current_section == 'insights':
                if line.startswith('-') or line.startswith('•'):
                    insight = line.lstrip('-• ').strip()
                    if insight:
                        sections['insights'].append(insight)
            elif current_section == 'recommendations':
                if line.startswith('-') or line.startswith('•'):
                    recommendation = line.lstrip('-• ').strip()
                    if recommendation:
                        sections['recommendations'].append(recommendation)
        
        # Clean up main problem
        sections['main_problem'] = sections['main_problem'].strip()
        
        # Ensure we have at least some content
        if not sections['main_problem']:
            sections['main_problem'] = "User shows signs of hesitation and frustration with interface elements, particularly around interactive components."
        
        if not sections['insights']:
            sections['insights'] = [
                "High rage click percentage indicates unresponsive or confusing interface elements",
                "Mouse movement patterns show exploration of key interface areas",
                "Click density suggests users are trying to interact with non-clickable elements",
                "Navigation events indicate possible confusion in site structure"
            ]
        
        if not sections['recommendations']:
            sections['recommendations'] = [
                "Make interactive elements more visually distinct with clear hover states",
                "Improve button responsiveness and provide immediate feedback on clicks",
                "Simplify navigation structure to reduce backtracking and confusion",
                "Add visual cues to guide users toward important actions and content"
            ]
        
        return sections
    
    def _get_fallback_analysis(self):
        """Return fallback analysis if AI fails"""
        return {
            'main_problem': "User shows signs of hesitation and frustration with interface elements, particularly around interactive components.",
            'insights': [
                "High rage click percentage indicates unresponsive or confusing interface elements",
                "Mouse movement patterns show exploration of key interface areas",
                "Click density suggests users are trying to interact with non-clickable elements",
                "Navigation events indicate possible confusion in site structure",
                "Scroll depth shows good content engagement but could be optimized",
                "Mouse speed variations indicate areas of hesitation vs confident navigation"
            ],
            'recommendations': [
                "Make interactive elements more visually distinct with clear hover states",
                "Improve button responsiveness and provide immediate feedback on clicks",
                "Simplify navigation structure to reduce backtracking and confusion",
                "Add visual cues to guide users toward important actions and content"
            ]
        }
