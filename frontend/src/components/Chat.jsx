import { useEffect } from 'react';

const Chat = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.chatbase.co/embed.min.js';
    script.async = true;
    script.id = '5Hh9J4IBOLdYC3HNvi37Z';

    script.onload = () => {
      window.chatbase && window.chatbase('initializeWithKey', 'm1zh0zqk1pik1t082ly5il78q0a8q1yv');
    };

    document.body.appendChild(script);

    return () => {
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return null;
};

export default Chat;
