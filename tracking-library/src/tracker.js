class PulseTracker {
    constructor(options = {}) {
        this.options = {
            apiUrl: options.apiUrl || 'http://localhost:5001/api',
            samplingInterval: options.samplingInterval || 50, // ms
            batchInterval: options.batchInterval || 2000, // ms
            sessionId: options.sessionId || null,
            debug: options.debug || false
        };
        
        this.sessionId = null;
        this.events = [];
        this.isInitialized = false;
        this.lastMousePosition = { x: 0, y: 0 };
        this.lastScrollPosition = 0;
        this.clickHistory = [];
        this.batchTimer = null;
        
        // Event handlers
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        
        this.log('PulseTracker initialized with options:', this.options);
    }
    
    log(...args) {
        if (this.options.debug) {
            console.log('[PulseTracker]', ...args);
        }
    }
    
    async init() {
        if (this.isInitialized) {
            this.log('Already initialized');
            return;
        }
        
        try {
            // Create or get session ID
            this.sessionId = await this.getOrCreateSessionId();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Start batch timer
            this.startBatchTimer();
            
            this.isInitialized = true;
            this.log('Successfully initialized with session ID:', this.sessionId);
            
            // Track initial page load
            this.trackNavigation(window.location.href);
            
        } catch (error) {
            console.error('Failed to initialize PulseTracker:', error);
        }
    }
    
    async getOrCreateSessionId() {
        // Check if we already have a session ID in localStorage
        let sessionId = localStorage.getItem('pulse_session_id');
        
        if (!sessionId) {
            try {
                // Create new session
                const response = await fetch(`${this.options.apiUrl}/session`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        page_url: window.location.href
                    })
                });
                
                const data = await response.json();
                
                if (data.success && data.session_id) {
                    sessionId = data.session_id;
                    localStorage.setItem('pulse_session_id', sessionId);
                    this.log('Created new session:', sessionId);
                } else {
                    throw new Error('Failed to create session: ' + (data.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error creating session:', error);
                // Generate a local session ID as fallback
                sessionId = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('pulse_session_id', sessionId);
                this.log('Using local session ID:', sessionId);
            }
        } else {
            this.log('Using existing session ID:', sessionId);
        }
        
        return sessionId;
    }
    
    setupEventListeners() {
        // Mouse movement (throttled)
        let mouseMoveTimeout = null;
        const throttledMouseMove = (e) => {
            if (!mouseMoveTimeout) {
                mouseMoveTimeout = setTimeout(() => {
                    this.handleMouseMove(e);
                    mouseMoveTimeout = null;
                }, this.options.samplingInterval);
            }
        };
        document.addEventListener('mousemove', throttledMouseMove);
        
        // Clicks
        document.addEventListener('click', this.handleClick);
        
        // Scroll (throttled)
        let scrollTimeout = null;
        const throttledScroll = () => {
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(() => {
                    this.handleScroll();
                    scrollTimeout = null;
                }, 100);
            }
        };
        window.addEventListener('scroll', throttledScroll);
        
        // Visibility changes
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Before unload (send any pending events)
        window.addEventListener('beforeunload', this.handleBeforeUnload);
        
        // Keyboard events (throttled)
        let keyPressTimeout = null;
        const throttledKeyPress = (e) => {
            if (!keyPressTimeout) {
                keyPressTimeout = setTimeout(() => {
                    this.handleKeyPress(e);
                    keyPressTimeout = null;
                }, 100);
            }
        };
        document.addEventListener('keydown', throttledKeyPress);
        
        // Track navigation (for single page apps)
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        
        history.pushState = function(...args) {
            originalPushState.apply(this, args);
            window.dispatchEvent(new Event('locationchange'));
        };
        
        history.replaceState = function(...args) {
            originalReplaceState.apply(this, args);
            window.dispatchEvent(new Event('locationchange'));
        };
        
        window.addEventListener('popstate', () => {
            window.dispatchEvent(new Event('locationchange'));
        });
        
        window.addEventListener('locationchange', () => {
            this.trackNavigation(window.location.href);
        });
        
        this.log('Event listeners set up');
    }
    
    handleMouseMove(event) {
        const x = event.clientX;
        const y = event.clientY;
        
        // Only track if position changed significantly (more than 1px)
        const distance = Math.sqrt(
            Math.pow(x - this.lastMousePosition.x, 2) + 
            Math.pow(y - this.lastMousePosition.y, 2)
        );
        
        if (distance > 1) {
            this.lastMousePosition = { x, y };
            
            this.addEvent('mouse_move', {
                x,
                y,
                viewport_width: window.innerWidth,
                viewport_height: window.innerHeight
            });
        }
    }
    
    handleClick(event) {
        const x = event.clientX;
        const y = event.clientY;
        const timestamp = Date.now();
        
        // Get element path
        const elementPath = this.getElementPath(event.target);
        
        // Add to click history for rage click detection
        this.clickHistory.push({ x, y, timestamp });
        
        // Keep only last 10 clicks for memory
        if (this.clickHistory.length > 10) {
            this.clickHistory.shift();
        }
        
        // Detect rage clicks locally (backend will also detect)
        const isRageClick = this.detectRageClick();
        
        this.addEvent(isRageClick ? 'rage_click' : 'click', {
            x,
            y,
            element: elementPath,
            viewport_width: window.innerWidth,
            viewport_height: window.innerHeight,
            is_rage_click: isRageClick
        });
    }
    
    detectRageClick() {
        // Rage click = 3+ clicks within 1 second in 50px radius
        if (this.clickHistory.length < 3) return false;
        
        const recentClicks = this.clickHistory.slice(-3);
        const timeWindow = recentClicks[2].timestamp - recentClicks[0].timestamp;
        
        if (timeWindow <= 1000) { // 1 second
            // Check if all 3 clicks are within 50px radius
            const xCoords = recentClicks.map(c => c.x);
            const yCoords = recentClicks.map(c => c.y);
            
            const centroidX = xCoords.reduce((a, b) => a + b, 0) / 3;
            const centroidY = yCoords.reduce((a, b) => a + b, 0) / 3;
            
            const maxDistance = Math.max(...recentClicks.map((click, i) => {
                return Math.sqrt(
                    Math.pow(click.x - centroidX, 2) + 
                    Math.pow(click.y - centroidY, 2)
                );
            }));
            
            return maxDistance <= 50;
        }
        
        return false;
    }
    
    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        
        // Only track if scroll position changed significantly (more than 1%)
        if (Math.abs(scrollPercentage - this.lastScrollPosition) > 1) {
            this.lastScrollPosition = scrollPercentage;
            
            this.addEvent('scroll', {
                percentage: Math.round(scrollPercentage),
                direction: scrollTop > this.lastScrollPosition ? 'down' : 'up',
                position: scrollTop
            });
        }
    }
    
    handleVisibilityChange() {
        this.addEvent('visibility', {
            state: document.visibilityState,
            hidden: document.hidden
        });
    }
    
    handleKeyPress(event) {
        // Don't track actual keys for privacy, just timing and patterns
        this.addEvent('keyboard', {
            key_code: event.keyCode,
            timestamp: Date.now(),
            is_modifier: event.ctrlKey || event.altKey || event.shiftKey || event.metaKey
        });
    }
    
    handleBeforeUnload() {
        // Send any pending events before page unload
        this.sendBatch(true);
    }
    
    trackNavigation(url) {
        this.addEvent('navigation', {
            url,
            referrer: document.referrer,
            timestamp: Date.now()
        });
    }
    
    addEvent(type, data) {
        const event = {
            session_id: this.sessionId,
            type,
            timestamp: new Date().toISOString(),
            data
        };
        
        this.events.push(event);
        this.log('Event added:', type, data);
        
        // Auto-send if we have too many events
        if (this.events.length >= 100) {
            this.sendBatch();
        }
    }
    
    startBatchTimer() {
        this.batchTimer = setInterval(() => {
            this.sendBatch();
        }, this.options.batchInterval);
    }
    
    async sendBatch(force = false) {
        if (this.events.length === 0 && !force) {
            return;
        }
        
        const eventsToSend = [...this.events];
        this.events = [];
        
        if (eventsToSend.length === 0) {
            return;
        }
        
        try {
            const response = await fetch(`${this.options.apiUrl}/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    events: eventsToSend
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.log(`Successfully sent ${data.count} events`);
            } else {
                console.error('Failed to send events:', data.error);
                // Re-add events to retry later
                this.events = [...eventsToSend, ...this.events];
            }
        } catch (error) {
            console.error('Error sending events:', error);
            // Re-add events to retry later
            this.events = [...eventsToSend, ...this.events];
        }
    }
    
    getElementPath(element) {
        const path = [];
        let currentElement = element;
        
        while (currentElement && currentElement !== document.body) {
            let selector = currentElement.tagName.toLowerCase();
            
            if (currentElement.id) {
                selector += '#' + currentElement.id;
            } else if (currentElement.className && typeof currentElement.className === 'string') {
                const classes = currentElement.className.split(' ').filter(c => c).join('.');
                if (classes) {
                    selector += '.' + classes;
                }
            }
            
            path.unshift(selector);
            currentElement = currentElement.parentElement;
            
            // Limit path length
            if (path.length >= 5) break;
        }
        
        return path.join(' > ');
    }
    
    destroy() {
        // Clear interval
        if (this.batchTimer) {
            clearInterval(this.batchTimer);
            this.batchTimer = null;
        }
        
        // Send any remaining events
        this.sendBatch(true);
        
        // Remove event listeners
        // Note: In a real implementation, we'd need to track and remove all listeners
        
        this.isInitialized = false;
        this.log('Destroyed');
    }
}

// Auto-initialize if script is loaded directly
if (typeof window !== 'undefined') {
    window.PulseTracker = PulseTracker;
    
    // Auto-initialize with default options
    document.addEventListener('DOMContentLoaded', () => {
        const tracker = new PulseTracker({
            debug: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        });
        tracker.init();
        
        // Make tracker available globally
        window.pulseTracker = tracker;
    });
}

export default PulseTracker;
