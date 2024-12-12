(() => {
  const loadSchema = async () => {
    try {
      const currentUrl = window.location.href;
      const domain = window.location.hostname;
      
      // Get the API URL from the page's runtime config
      const runtimeConfig = window.__NEXT_DATA__?.runtimeConfig || {};
      const apiBase = runtimeConfig.schemaApiUrl || '/api/schema';
      const apiUrl = `${apiBase}?url=${encodeURIComponent(currentUrl)}&domain=${domain}`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        console.error('Failed to load schema:', response.statusText);
        return;
      }
      
      const data = await response.json();
      if (!data.schemas || !data.schemas.length) {
        console.log('No schemas found for this page');
        return;
      }

      // Add each schema to the page
      data.schemas.forEach(schema => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schema);
        document.head.appendChild(script);
      });
      
      console.log('Schemas loaded successfully');
    } catch (error) {
      console.error('Error loading schema:', error);
    }
  };

  // Load schema when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSchema);
  } else {
    loadSchema();
  }
})();
