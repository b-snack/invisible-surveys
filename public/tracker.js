(function() {
  // Generate unique session ID
  const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
  const pageUrl = window.location.href;
  let events = [];
  
  // Immediately create session
  fetch('/api/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, page_url: pageUrl })
  });
  
  // Event tracking functions
  function trackEvent(type, data) {
    events.push({
      type,
      session_id: sessionId,
      data: JSON.stringify(data),
      timestamp: new Date().toISOString()
    });
  }
  
  // Track cursor position every 100ms
  let lastTrackTime = 0;
  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTrackTime >= 100) {
      trackEvent('mousemove', { x: e.clientX, y: e.clientY });
      lastTrackTime = now;
    }
  });
  
  // Remove the duplicate mousemove listener
  
  // Click handler
  function handleClick(e) {
    trackEvent('click', { 
      x: e.clientX, 
      y: e.clientY,
      element: e.target.tagName,
      class: e.target.className,
      id: e.target.id
    });
  }
  
  // Scroll handler
  function handleScroll() {
    trackEvent('scroll', {
      x: window.scrollX,
      y: window.scrollY
    });
  }
  
  // Set up event listeners
  document.addEventListener('click', handleClick);
  window.addEventListener('scroll', handleScroll);
  
  // Batch event sending
  setInterval(() => {
    if (events.length === 0) return;
    
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(events)
    }).then(() => {
      events = [];
    }).catch(error => {
      console.error('Tracking error:', error);
    });
  }, 1000);
})();
