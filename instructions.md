Build a user behavior tracking system with these components:

BACKEND (Flask + MongoDB):

1. Track these events:

   - Mouse movements (x, y coordinates, timestamp)
   - Mouse clicks (x, y coordinates, element clicked, timestamp)
   - Page navigation (URL changes, timestamp)
   - Scroll position (depth percentage, timestamp)
   - Keyboard presses (no actual keys, just timing/speed)
   - Rage clicks (3+ clicks in same area within 1 second)

2. Store everything in MongoDB Atlas with this connection string:
   mongodb+srv://user123:9rIV1Un8AaWtbLaY@uottahack.zect11y.mongodb.net/pulse_feedback?retryWrites=true&w=majority

3. Collections needed:

   - sessions: {session_id, started_at, page_url}
   - events: {session_id, type, timestamp, data (x, y, etc)}

4. API endpoints:

   - POST /api/session - create new session
   - POST /api/track - receive tracking events (batch)
   - GET /api/sessions - list all sessions
   - GET /api/analytics/<session_id> - get all events for a session
   - GET /api/heatmap/<session_id> - get click + mouse movement data for heatmap
   - POST /api/analyze/<session_id> - use Gemini AI to analyze user behavior and generate UX recommendations

5. Use Gemini API key: AIzaSyA8XUBVCFaV3d6gfeA0-1O8IqakQ6DjvVo

FRONTEND TRACKING LIBRARY (JavaScript):

1. Auto-initialize on page load (no user action needed)
2. Track EVERY mouse movement (sample every 50ms to avoid overload)
3. Track EVERY click with coordinates + element path
4. Detect rage clicks (3+ clicks within 1 second in 50px radius)
5. Track page visibility changes (tab switches)
6. Track scroll depth and direction changes
7. Batch events and send to backend every 2 seconds
8. Create unique session ID on load

DASHBOARD (React):

1. Show list of sessions (auto-refresh every 3 seconds)
2. When session is clicked, show:
   - Metrics cards: Total clicks, Rage clicks, Mouse movements, Scroll events
   - Interactive heatmap on HTML canvas showing:
     - Blue semi-transparent dots for mouse movements
     - Green circles for normal clicks
     - Red circles for rage clicks
   - Button to "Generate AI Insights"
3. AI insights section shows:
   - Main usability problem
   - 4-6 specific insights about navigation
   - 3-4 actionable UX recommendations

DEMO WEBSITE:
Create a simple e-commerce product page with:

- Product image and description
- Add to cart button
- Checkout section with 12 payment buttons
- Make some buttons intentionally non-responsive to trigger rage clicks
- Integrate the tracking library

FOR ALL WEBSITES, MAKE IT SLEEK, LIKE APPLE WEBSITES, NO GRADIENTS WHATSOEVER, NO WEIRD HOVERING ANIMATIONS.

IMPORTANT:

- Backend runs on port 5001 (not 5000 - Mac uses that)
- Dashboard runs on port 3000
- Demo site runs on port 8080
- All mouse movements must be stored in MongoDB (both per user, and all of them)
- Heatmap must show actual mouse trails, not just clicks; clicks should be displayed spearately to heatmaps
- shuold track navigation through the apges
- AI must analyze mouse speed, hover patterns, click locations to identify UX problems
