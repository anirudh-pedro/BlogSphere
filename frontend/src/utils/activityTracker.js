// utils/activityTracker.js
/**
 * Utility class to track user activity and send it to the backend
 * This should be imported and initialized in your main App component
 */
class ActivityTracker {
    constructor() {
      this.sessionStart = null;
      this.lastActivity = null;
      this.activityType = 'browsing';
      this.isTracking = false;
      this.idleTimeout = null;
      this.idleThreshold = 3 * 60 * 1000; // 3 minutes
      this.token = null;
    }
  
    /**
     * Initialize the activity tracker
     * @param {String} token - User authentication token
     */
    init(token) {
      if (!token) {
        console.warn('ActivityTracker: No token provided');
        return;
      }
      
      this.token = token;
      this.startTracking();
      
      // Add event listeners to track user activity
      document.addEventListener('mousemove', this.handleUserActivity.bind(this));
      document.addEventListener('keypress', this.handleUserActivity.bind(this));
      document.addEventListener('click', this.handleUserActivity.bind(this));
      document.addEventListener('scroll', this.handleUserActivity.bind(this));
      
      // Handle page visibility changes
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
      
      // Handle before unload (user leaves the page)
      window.addEventListener('beforeunload', this.endSession.bind(this));
    }
  
    /**
     * Start tracking user activity
     */
    startTracking() {
      if (this.isTracking) return;
      
      this.sessionStart = new Date();
      this.lastActivity = new Date();
      this.isTracking = true;
      
      // Set idle timeout
      this.resetIdleTimeout();
      
      console.log('ActivityTracker: Started tracking');
    }
  
    /**
     * Stop tracking user activity
     */
    stopTracking() {
      if (!this.isTracking) return;
      
      this.endSession();
      this.isTracking = false;
      
      if (this.idleTimeout) {
        clearTimeout(this.idleTimeout);
        this.idleTimeout = null;
      }
      
      console.log('ActivityTracker: Stopped tracking');
    }
  
    /**
     * Set the current activity type
     * @param {String} type - Activity type (browsing, writing, editing, reading)
     */
    setActivityType(type) {
      const validTypes = ['browsing', 'writing', 'editing', 'reading'];
      if (validTypes.includes(type)) {
        // If we're changing activity type, end the current session and start a new one
        if (this.isTracking && this.activityType !== type) {
          this.endSession();
          this.activityType = type;
          this.startTracking();
        } else {
          this.activityType = type;
        }
      }
    }
  
    /**
     * Handle user activity event
     */
    handleUserActivity() {
      if (!this.isTracking) return;
      
      this.lastActivity = new Date();
      this.resetIdleTimeout();
    }
  
    /**
     * Reset the idle timeout
     */
    resetIdleTimeout() {
      if (this.idleTimeout) {
        clearTimeout(this.idleTimeout);
      }
      
      this.idleTimeout = setTimeout(() => {
        // User is idle, end the session
        if (this.isTracking) {
          this.endSession();
          this.isTracking = false;
        }
      }, this.idleThreshold);
    }
  
    /**
     * Handle visibility change (tab focus/blur)
     */
    handleVisibilityChange() {
      if (document.hidden) {
        // Page is hidden, pause tracking
        if (this.isTracking) {
          this.endSession();
          this.isTracking = false;
        }
      } else {
        // Page is visible again, resume tracking
        this.startTracking();
      }
    }
  
    /**
     * End the current session and send data to server
     */
    endSession() {
      if (!this.isTracking || !this.sessionStart) return;
      
      const sessionEnd = new Date();
      const sessionDuration = sessionEnd - this.sessionStart;
      
      // Only record sessions longer than 5 seconds
      if (sessionDuration > 5000) {
        this.sendActivityData(this.sessionStart, sessionEnd);
      }
      
      this.sessionStart = null;
    }
  
    /**
     * Send activity data to the server
     * @param {Date} start - Session start time
     * @param {Date} end - Session end time
     */
    sendActivityData(start, end) {
      if (!this.token) return;
      
      const data = {
        sessionStart: start.toISOString(),
        sessionEnd: end.toISOString(),
        activityType: this.activityType
      };
      
      // Use sendBeacon for more reliable delivery, especially during page unload
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        navigator.sendBeacon('http://localhost:5000/api/stats/track-activity', blob);
        
        console.log('ActivityTracker: Sent activity data via beacon');
      } else {
        // Fallback to fetch
        fetch('http://localhost:5000/api/stats/track-activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify(data),
          // Keep-alive to ensure data is sent
          keepalive: true
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to record activity');
          }
          console.log('ActivityTracker: Sent activity data via fetch');
        })
        .catch(error => {
          console.error('ActivityTracker: Error sending activity data:', error);
        });
      }
    }
  
    /**
     * Cleanup and remove event listeners
     */
    cleanup() {
      this.stopTracking();
      
      document.removeEventListener('mousemove', this.handleUserActivity);
      document.removeEventListener('keypress', this.handleUserActivity);
      document.removeEventListener('click', this.handleUserActivity);
      document.removeEventListener('scroll', this.handleUserActivity);
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      window.removeEventListener('beforeunload', this.endSession);
      
      console.log('ActivityTracker: Cleaned up');
    }
  }
  
  // Create a singleton instance
  const activityTracker = new ActivityTracker();
  
  export default activityTracker;