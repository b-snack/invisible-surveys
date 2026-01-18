# CLINE: Build Invisible Survey Tracker

## THE IDEA

Track real user behavior on websites without surveys. Record mouse movements (every 100ms), clicks, and scrolls. Send data to Gemini AI which tells you exactly what's wrong with your website design and how to fix it.

## TECH STACK

- Next.js 14+ TypeScript App Router
- SQLite (better-sqlite3)
- Tailwind CSS
- Lucide React icons ONLY
- Gemini API

## DESIGN RULES (CRITICAL)

- Apple style: clean, minimal, white/gray/blue only
- NO gradients ever
- NO emojis anywhere
- Lucide icons only
- Font: font-light headings, font-normal body
- Shadows: shadow-sm only
- Rounded corners: rounded-lg

## WHAT TO BUILD

### 1. Database (lib/db.ts)

Set up SQLite with better-sqlite3. Create two tables:

**sessions table:**

- id (text primary key)
- started_at (datetime)
- page_url (text)

**events table:**

- id (integer primary key autoincrement)
- session_id (text, foreign key)
- type (text)
- timestamp (datetime)
- data (text, stores JSON)

### 2. API Routes

**POST /api/session**

- Accept session_id and page_url
- Insert into sessions table
- Return success

**POST /api/track**

- Accept array of events
- Batch insert into events table using transaction
- Store data as JSON string

**GET /api/sessions**

- Return all sessions ordered by newest first

**GET /api/analytics/[id]**

- Get session by id
- Get all events for that session
- Parse JSON data fields
- Return session + events

**POST /api/analyze/[id]**

- Get all events for session
- Count clicks, mouse movements, scrolls
- Find most active areas (cluster coordinates)
- Build prompt for Gemini asking for UX analysis
- Call Gemini API REST endpoint with prompt
- Return Gemini's analysis text

### 3. Tracking Library (public/tracker.js)

Vanilla JavaScript that:

- Auto-runs on page load (IIFE)
- Generates unique session_id
- Immediately creates session via POST /api/session
- Tracks these events:
  - Mouse movements (throttled to every 100ms, record x/y)
  - Clicks (record x/y and element)
  - Scrolls (record position)
- Stores events in memory array
- Every 1 second, batch sends to POST /api/track
- Clears array after send
- Uses fetch API

### 4. Demo Page (app/demo/page.tsx)

E-commerce product page with:

- Product title, image, description, price
- "Add to Cart" button (works)
- Grid of 12 payment buttons (make 4 of them NOT work - no hover, no click handler)
- Load tracker.js in script tag with defer
- Apple design: white card on gray background, clean spacing

### 5. Dashboard (app/page.tsx)

Client component with:

**Left side - Sessions list:**

- Shows all sessions
- Auto-refresh every 3 seconds
- Click session to load its data
- Show page URL and timestamp for each

**Right side - Analytics:**
When session selected, show:

- Three metric cards: Total Clicks, Mouse Movements, Scroll Events
- Canvas element for heatmap
- Draw blue dots for mouse movements
- Draw green circles for clicks
- "Generate AI Insights" button
- Display Gemini analysis when clicked

Use Lucide icons: Activity, MousePointer2, Lightbulb

## BUILD ORDER

1. Database setup
2. All API routes
3. Tracking library
4. Demo page
5. Dashboard

Test after each step. Make sure dependencies are installed before starting.

## ENVIRONMENT

Create .env.local with:
GEMINI_API_KEY=AIzaSyA8XUBVCFaV3d6gfeA0-1O8IqakQ6DjvVo

## SUCCESS

- npm run dev works on port 3000
- Demo page tracks mouse/clicks
- Dashboard shows sessions
- Heatmap draws on canvas
- Gemini returns specific UX recommendations
- Zero emojis, clean design
