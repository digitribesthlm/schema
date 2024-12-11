import React from 'react';
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = '/schema-loader.js';  // Note: Loading from public folder
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  return <Component {...pageProps} />;
}
