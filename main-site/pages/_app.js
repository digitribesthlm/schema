import React from 'react';

function MyApp({ Component, pageProps }) {
  React.useEffect(() => {
    try {
      // Remove any existing schema loader
      const existingLoader = document.querySelector('script[data-schema-loader]');
      if (existingLoader) {
        existingLoader.remove();
      }

      const script = document.createElement('script');
      script.src = 'http://localhost:3000/schema-loader.js';
      script.async = true;
      script.defer = true;
      script.setAttribute('data-schema-loader', 'true');
      script.onerror = (error) => {
        console.error('Error loading schema script:', error);
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error in schema loader setup:', error);
    }
  }, []);

  return <Component {...pageProps} />
}

export default MyApp; 