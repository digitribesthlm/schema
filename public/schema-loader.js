import getConfig from 'next/config';

(function() {
  const { publicRuntimeConfig } = getConfig();
  const SCHEMA_API = publicRuntimeConfig.schemaApiUrl;
  const CACHE_KEY = 'schema_cache';
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  const getCachedSchemas = () => {
    try {
      const cache = localStorage.getItem(CACHE_KEY);
      if (!cache) return null;

      const { schemas, timestamp, url } = JSON.parse(cache);
      const isExpired = Date.now() - timestamp > CACHE_DURATION;
      const urlChanged = url !== window.location.href;

      if (isExpired || urlChanged) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return schemas;
    } catch (error) {
      console.error('Cache error:', error);
      return null;
    }
  };

  const injectSchemas = (schemas) => {
    if (!schemas || !Array.isArray(schemas)) return;
    
    try {
      document.querySelectorAll('script[type="application/ld+json"]')
        .forEach(script => script.remove());

      schemas.forEach(schema => {
        if (!schema) return;
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error('Schema injection error:', error);
    }
  };

  const loadSchemas = async () => {
    const cachedSchemas = getCachedSchemas();
    if (cachedSchemas) {
      injectSchemas(cachedSchemas);
      return;
    }

    try {
      const apiUrl = new URL(SCHEMA_API, window.location.origin);
      apiUrl.searchParams.set('url', window.location.href);
      apiUrl.searchParams.set('domain', window.location.hostname);

      const response = await fetch(apiUrl.toString());
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const { schemas } = await response.json();
      if (schemas && Array.isArray(schemas)) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          schemas,
          timestamp: Date.now(),
          url: window.location.href
        }));
        injectSchemas(schemas);
      }
    } catch (error) {
      console.error('Schema loading error:', error);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSchemas);
  } else {
    loadSchemas();
  }
})();