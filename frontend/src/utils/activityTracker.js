/**
 * ActivityTracker.js - Client-side activity tracking utility
 * 
 * Tracks user interaction with the application and sends
 * activity sessions to the backend for analytics.
 */
class ActivityTracker {
  constructor() {
    this.sessionStart = null;
    this.lastActivity = null;
    this.activityType = 'browsing';
    this.isTracking = false;
    this.idleTimeout = null;
    this.idleThreshold = 3 * 60 * 1000; // 3 minutes of inactivity
    this.minSessionDuration = 5 * 1000; // 5 seconds
    this.token = null;
    this.boundHandleUserActivity = this.handleUserActivity.bind(this);
    this.boundHandleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.boundEndSession = this.endSession.bind(this);
    this.apiEndpoint = 'http://localhost:5000/api/stats/track-activity';
    this.debugMode = false;
    this.currentPageName = '';
    this.pendingActivities = [];
    this.retryAttempts = 3;
    this.retryDelay = 2000; // 2 seconds
  }

  /**
   * Initialize the activity tracker with user authentication
   * @param {String} token - User authentication token
   * @param {Object} options - Optional configuration
   */
  init(token, options = {}) {
    if (!token) {
      this.logDebug('ActivityTracker: No token provided');
      // Try to get token from localStorage if not provided
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData && userData.token) {
          token = userData.token;
          this.logDebug('ActivityTracker: Retrieved token from localStorage');
        } else {
          return;
        }
      } catch (error) {
        this.logDebug('ActivityTracker: Failed to get token from localStorage');
        return;
      }
    }
    
    // Check if token has changed
    if (this.token !== token) {
      // Clean up existing session if token changed
      if (this.isTracking) {
        this.endSession();
      }
      this.cleanup();
    }
    
    // Apply configuration options
    if (options.idleThreshold) this.idleThreshold = options.idleThreshold;
    if (options.minSessionDuration) this.minSessionDuration = options.minSessionDuration;
    if (options.apiEndpoint) this.apiEndpoint = options.apiEndpoint;
    if (options.debugMode !== undefined) this.debugMode = options.debugMode;
    if (options.pageName) this.currentPageName = options.pageName;
    
    this.token = token;
    
    // Add event listener for auth errors
    window.addEventListener('activity-tracker-auth-error', this.handleAuthError.bind(this));
    
    this.startTracking();
    
    // Add event listeners to track user activity
    this.attachEventListeners();
    
    // Try to send any pending activities from previous sessions
    this.processPendingActivities();
    
    this.logDebug('ActivityTracker: Initialized');
    
    return this; // For method chaining
  }
  
  /**
   * Attach all event listeners
   */
  attachEventListeners() {
    document.addEventListener('mousemove', this.boundHandleUserActivity);
    document.addEventListener('keypress', this.boundHandleUserActivity);
    document.addEventListener('click', this.boundHandleUserActivity);
    document.addEventListener('scroll', this.boundHandleUserActivity);
    document.addEventListener('touchstart', this.boundHandleUserActivity);
    document.addEventListener('touchmove', this.boundHandleUserActivity);
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', this.boundHandleVisibilityChange);
    
    // Handle before unload (user leaves the page)
    window.addEventListener('beforeunload', this.boundEndSession);
  }
  
  /**
   * Remove all event listeners
   */
  detachEventListeners() {
    document.removeEventListener('mousemove', this.boundHandleUserActivity);
    document.removeEventListener('keypress', this.boundHandleUserActivity);
    document.removeEventListener('click', this.boundHandleUserActivity);
    document.removeEventListener('scroll', this.boundHandleUserActivity);
    document.removeEventListener('touchstart', this.boundHandleUserActivity);
    document.removeEventListener('touchmove', this.boundHandleUserActivity);
    document.removeEventListener('visibilitychange', this.boundHandleVisibilityChange);
    window.removeEventListener('beforeunload', this.boundEndSession);
  }

  /**
   * Start tracking user activity
   * @returns {ActivityTracker} - Returns this instance for method chaining
   */
  startTracking() {
    if (this.isTracking) return this;
    
    this.sessionStart = new Date();
    this.lastActivity = new Date();
    this.isTracking = true;
    
    // Set idle timeout
    this.resetIdleTimeout();
    
    this.logDebug('ActivityTracker: Started tracking');
    
    return this;
  }

  /**
   * Stop tracking user activity
   * @param {Boolean} sendData - Whether to send the current session data before stopping
   * @returns {ActivityTracker} - Returns this instance for method chaining
   */
  stopTracking(sendData = true) {
    if (!this.isTracking) return this;
    
    if (sendData) {
      this.endSession();
    }
    
    this.isTracking = false;
    
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }
    
    this.logDebug('ActivityTracker: Stopped tracking');
    
    return this;
  }

  /**
   * Set the current activity type and optionally the page name
   * @param {String} type - Activity type (browsing, writing, editing, reading)
   * @param {String} pageName - Optional page or section name
   * @returns {ActivityTracker} - Returns this instance for method chaining
   */
  setActivityType(type, pageName) {
    const validTypes = ['browsing', 'writing', 'editing', 'reading', 'analyzing', 'interactive'];
    
    if (!validTypes.includes(type)) {
      this.logDebug(`ActivityTracker: Invalid activity type: ${type}`);
      return this;
    }
    
    // If we're changing activity type, end the current session and start a new one
    if (this.isTracking && this.activityType !== type) {
      this.endSession();
      this.activityType = type;
      
      if (pageName !== undefined) {
        this.currentPageName = pageName;
      }
      
      this.startTracking();
      
      this.logDebug(`ActivityTracker: Changed activity type to ${type}`);
    } else {
      this.activityType = type;
      
      if (pageName !== undefined) {
        this.currentPageName = pageName;
      }
    }
    
    return this;
  }

  /**
   * Handle user activity events
   * @param {Event} event - DOM event that triggered activity
   */
  handleUserActivity(event) {
    if (!this.isTracking) return;
    
    this.lastActivity = new Date();
    this.resetIdleTimeout();
    
    // Optionally track specific interaction types for more detailed analytics
    if (this.debugMode && event) {
      this.logDebug(`ActivityTracker: User activity - ${event.type}`);
    }
  }

  /**
   * Reset the idle timeout timer
   */
  resetIdleTimeout() {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }
    
    this.idleTimeout = setTimeout(() => {
      // User is idle, end the session
      if (this.isTracking) {
        this.logDebug('ActivityTracker: User idle timeout reached');
        this.endSession();
        this.isTracking = false;
      }
    }, this.idleThreshold);
  }

  /**
   * Handle page visibility changes
   */
  handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden, pause tracking
      if (this.isTracking) {
        this.logDebug('ActivityTracker: Page hidden, ending session');
        this.endSession();
        this.isTracking = false;
      }
    } else {
      // Page is visible again, resume tracking
      this.logDebug('ActivityTracker: Page visible, starting session');
      this.startTracking();
    }
  }

  /**
   * End the current activity session
   */
  endSession() {
    if (!this.isTracking || !this.sessionStart) return;
    
    const sessionEnd = new Date();
    const sessionDuration = sessionEnd - this.sessionStart;
    
    // Only record sessions longer than minimum duration
    if (sessionDuration > this.minSessionDuration) {
      this.sendActivityData(this.sessionStart, sessionEnd);
    } else {
      this.logDebug(`ActivityTracker: Session too short (${sessionDuration}ms), not recording`);
    }
    
    this.sessionStart = null;
  }

  /**
   * Send activity data to the server
   * @param {Date} start - Session start time
   * @param {Date} end - Session end time
   */
  sendActivityData(start, end) {
    if (!this.token) {
      this.logDebug('ActivityTracker: No token available, cannot send data');
      return;
    }
    
    const data = {
      sessionStart: start.toISOString(),
      sessionEnd: end.toISOString(),
      activityType: this.activityType,
      pageName: this.currentPageName,
      duration: end - start, // Duration in milliseconds
      userAgent: navigator.userAgent,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    
    // Try to use sendBeacon for more reliable delivery, especially during page unload
    if (navigator.sendBeacon) {
      try {
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${this.token}`);
        
        const blob = new Blob([JSON.stringify(data)], { 
          type: 'application/json' 
        });
        
        const result = navigator.sendBeacon(this.apiEndpoint, blob);
        
        if (result) {
          this.logDebug('ActivityTracker: Sent activity data via beacon');
        } else {
          this.logDebug('ActivityTracker: Failed to send via beacon, will queue');
          this.queueActivityData(data);
        }
      } catch (error) {
        this.logDebug(`ActivityTracker: Error sending via beacon: ${error.message}`);
        this.queueActivityData(data);
      }
    } else {
      // Fallback to fetch with keepalive
      this.sendWithFetch(data);
    }
  }
  
  /**
   * Send activity data using fetch API
   * @param {Object} data - Activity data to send
   * @param {Number} attempt - Current attempt number for retries
   */
  sendWithFetch(data, attempt = 1) {
    // Verify token exists before sending
    if (!this.token) {
      this.logDebug('ActivityTracker: No token available for request');
      this.queueActivityData(data);
      return;
    }

    fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(data),
      // Keep-alive to ensure data is sent
      keepalive: true
    })
    .then(async response => {
      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid or expired
          this.logDebug('ActivityTracker: Authentication failed, attempting token refresh');
          // Try to get fresh token from localStorage
          try {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData && userData.token) {
              // Always refresh token on 401, regardless of current token
              this.token = userData.token;
              // Retry the request with new token
              return this.sendWithFetch(data, attempt);
            } else {
              this.token = null;
              this.stopTracking(false);
              this.queueActivityData(data);
              // Dispatch event for app to handle re-authentication
              window.dispatchEvent(new CustomEvent('activity-tracker-auth-error', {
                detail: { message: 'Token expired or invalid' }
              }));
              return;
            }
          } catch (error) {
            this.logDebug('ActivityTracker: Failed to refresh token');
            this.token = null;
            this.stopTracking(false);
            this.queueActivityData(data);
            window.dispatchEvent(new CustomEvent('activity-tracker-auth-error'));
            return;
          }
        }
        throw new Error(`HTTP error ${response.status}`);
      }
      this.logDebug('ActivityTracker: Sent activity data via fetch');
    })
    .catch(error => {
      this.logDebug(`ActivityTracker: Error sending activity data (attempt ${attempt}): ${error.message}`);
      
      // Retry if we haven't reached max attempts
      if (attempt < this.retryAttempts) {
        setTimeout(() => {
          this.sendWithFetch(data, attempt + 1);
        }, this.retryDelay * attempt); // Exponential backoff
      } else {
        // Queue for later if all retries failed
        this.queueActivityData(data);
      }
    });
  }
  
  /**
   * Queue activity data for later sending
   * @param {Object} data - Activity data to queue
   */
  queueActivityData(data) {
    try {
      // Get existing queue
      const queueStr = localStorage.getItem('activityTrackerQueue');
      const queue = queueStr ? JSON.parse(queueStr) : [];
      
      // Add new item
      queue.push({
        data,
        timestamp: new Date().getTime()
      });
      
      // Save back to localStorage (limit queue size to 100 items)
      localStorage.setItem('activityTrackerQueue', JSON.stringify(queue.slice(-100)));
      
      this.logDebug('ActivityTracker: Queued activity data for later sending');
    } catch (error) {
      this.logDebug(`ActivityTracker: Error queueing activity data: ${error.message}`);
    }
  }
  
  /**
   * Process any pending activities stored in localStorage
   */
  processPendingActivities() {
    try {
      const queueStr = localStorage.getItem('activityTrackerQueue');
      if (!queueStr) return;
      
      const queue = JSON.parse(queueStr);
      if (!Array.isArray(queue) || queue.length === 0) return;
      
      this.logDebug(`ActivityTracker: Processing ${queue.length} pending activities`);
      
      // Copy queue and clear storage
      this.pendingActivities = [...queue];
      localStorage.removeItem('activityTrackerQueue');
      
      // Process in batches or individually
      this.processBatch();
    } catch (error) {
      this.logDebug(`ActivityTracker: Error processing pending activities: ${error.message}`);
    }
  }
  
  /**
   * Process a batch of pending activities
   */
  processBatch() {
    if (!this.pendingActivities.length) return;
    
    // Take next item
    const item = this.pendingActivities.shift();
    
    // Send it
    this.sendWithFetch(item.data);
    
    // Process next batch after delay
    if (this.pendingActivities.length) {
      setTimeout(() => this.processBatch(), 1000);
    }
  }

  /**
   * Cleanup and remove event listeners
   */
  cleanup() {
    this.stopTracking();
    this.detachEventListeners();
    
    // Remove auth error listener
    window.removeEventListener('activity-tracker-auth-error', this.handleAuthError.bind(this));
    
    // Process any final data
    this.processPendingActivities();
    
    // Clear token
    this.token = null;
    
    this.logDebug('ActivityTracker: Cleaned up');
  }

  /**
   * Handle authentication errors
   */
  handleAuthError() {
    this.logDebug('ActivityTracker: Authentication error occurred');
    this.token = null;
    this.stopTracking(false);
    
    // Get fresh token from localStorage
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData && userData.token) {
        this.token = userData.token;
        this.startTracking();
        this.logDebug('ActivityTracker: Reinitialized with fresh token');
      }
    } catch (error) {
      this.logDebug('ActivityTracker: Failed to get fresh token');
    }
  }
  
  /**
   * Log debug messages if debug mode is enabled
   * @param {String} message - Debug message to log
   */
  logDebug(message) {
    if (this.debugMode) {
      console.log(message);
    }
  }
  
  /**
   * Get current tracking status and statistics
   * @returns {Object} - Current tracking status
   */
  getStatus() {
    return {
      isTracking: this.isTracking,
      activityType: this.activityType,
      currentPageName: this.currentPageName,
      sessionStart: this.sessionStart,
      lastActivity: this.lastActivity,
      currentSessionDuration: this.sessionStart ? (new Date() - this.sessionStart) : 0,
      pendingActivities: this.pendingActivities.length
    };
  }
}

// Create a singleton instance
const activityTracker = new ActivityTracker();

export default activityTracker;