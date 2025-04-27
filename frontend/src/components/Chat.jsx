import { useEffect } from 'react';

const Chat = () => {
  useEffect(() => {
    // Initialize Chatbase script
    if (!window.chatbase || window.chatbase("getState") !== "initialized") {
      window.chatbase = (...args) => {
        if (!window.chatbase.q) {
          window.chatbase.q = [];
        }
        window.chatbase.q.push(args);
      };
      
      window.chatbase = new Proxy(window.chatbase, {
        get(target, prop) {
          if (prop === "q") {
            return target.q;
          }
          return (...args) => target(prop, ...args);
        }
      });
    }

    // Load the script
    const script = document.createElement('script');
    script.src = 'https://www.chatbase.co/embed.min.js';
    script.id = '5Hh9J4IBOLdYC3HNvi37Z';
    script.domain = 'www.chatbase.co';
    script.async = true;
    
    // Add the script to the DOM
    document.body.appendChild(script);
    
    // Initialize with your API key
    script.onload = () => {
      window.chatbase('initializeWithKey', 'm1zh0zqk1pik1t082ly5il78q0a8q1yv');
      
      // Set up a more aggressive approach to hide the branding
      const removeBranding = () => {
        // Add very specific CSS targeting
        const style = document.createElement('style');
        style.setAttribute('data-chatbase-custom', 'true');
        style.textContent = `
          /* Target every possible variation of branding elements */
          [class*="powered-by"],
          [class*="Powered-by"],
          [class*="PoweredBy"],
          [class*="poweredBy"],
          div[class*="footer"] a,
          .chatbase-attribution,
          iframe[src*="chatbase"] ~ div a,
          [class*="brand"],
          [class*="Brand"],
          a[href*="chatbase.co"],
          div[id*="chatbase"] div > a,
          div[class*="chat"] > div:last-child > a,
          div[class*="chat"] > div:last-child > div > a {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            height: 0 !important;
            max-height: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: hidden !important;
            pointer-events: none !important;
          }
          
          /* Target parent containers that might only contain the branding */
          div[class*="footer"],
          div[class*="Footer"],
          div[class*="bottom"]:has(a[href*="chatbase"]),
          div:has(> a[href*="chatbase.co"]) {
            display: none !important;
            height: 0 !important;
            max-height: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: hidden !important;
          }
        `;
        document.head.appendChild(style);
        
        // Direct DOM manipulation to remove elements as well
        const removeLinks = () => {
          // Find and remove all links pointing to chatbase.co
          document.querySelectorAll('a[href*="chatbase.co"]').forEach(el => {
            if (el.parentElement) {
              // Try to remove the entire container
              el.parentElement.style.display = 'none';
              el.parentElement.style.height = '0';
              el.parentElement.style.overflow = 'hidden';
            }
            el.style.display = 'none';
          });
          
          // Look for elements with text content containing "chatbase" or "powered by"
          document.querySelectorAll('div, span, p').forEach(el => {
            if (el.textContent && 
                (el.textContent.toLowerCase().includes('chatbase') || 
                 el.textContent.toLowerCase().includes('powered by'))) {
              el.style.display = 'none';
              if (el.parentElement) {
                el.parentElement.style.display = 'none';
              }
            }
          });
        };
        
        // Run multiple times to catch elements that might load later
        removeLinks();
        setTimeout(removeLinks, 1000);
        setTimeout(removeLinks, 2000);
        setTimeout(removeLinks, 5000);
        
        // Set up a mutation observer to catch dynamically added elements
        const observer = new MutationObserver((mutations) => {
          removeLinks();
        });
        
        // Start observing the chat container
        const chatContainers = document.querySelectorAll('[id*="chatbase"], [class*="chatbase"], [class*="chat-container"]');
        chatContainers.forEach(container => {
          observer.observe(container, { 
            childList: true, 
            subtree: true 
          });
        });
        
        // Also observe the body for any new chat elements
        observer.observe(document.body, { 
          childList: true, 
          subtree: true 
        });
        
        return observer;
      };
      
      // Delay a bit to ensure chatbase is fully loaded
      const timeoutId = setTimeout(removeBranding, 1000);
      
      // Store the observer in window for cleanup
      window._chatbaseObserver = removeBranding();
      
      // Store the timeout ID for cleanup
      window._chatbaseTimeoutId = timeoutId;
    };
    
    // Cleanup function
    return () => {
      if (document.getElementById('5Hh9J4IBOLdYC3HNvi37Z')) {
        document.body.removeChild(script);
      }
      
      // Clean up the custom style
      const customStyle = document.querySelector('style[data-chatbase-custom]');
      if (customStyle) {
        document.head.removeChild(customStyle);
      }
      
      // Disconnect the observer if it exists
      if (window._chatbaseObserver) {
        window._chatbaseObserver.disconnect();
      }
      
      // Clear any pending timeouts
      if (window._chatbaseTimeoutId) {
        clearTimeout(window._chatbaseTimeoutId);
      }
    };
  }, []);

  return null;
};

export default Chat;