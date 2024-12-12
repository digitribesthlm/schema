(() => {
  const loadSchema = async () => {
    try {
      const currentUrl = window.location.href;
      const domain = window.location.hostname;
      
      // Get the API URL from the page's runtime config
      const runtimeConfig = window.__NEXT_DATA__?.runtimeConfig || {};
      const apiBase = runtimeConfig.schemaApiUrl || '/api/schema';
      const apiUrl = `${apiBase}?url=${encodeURIComponent(currentUrl)}&domain=${domain}&format=html`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        console.error('Failed to load schema:', response.statusText);
        return;
      }
      
      const schemaHtml = await response.text();
      if (!schemaHtml) {
        console.log('No schemas found for this page');
        return;
      }

      // Create a temporary container and set its HTML
      const temp = document.createElement('div');
      temp.innerHTML = schemaHtml;
      
      // Move each script tag to the head
      const scripts = temp.getElementsByTagName('script');
      while (scripts.length > 0) {
        document.head.appendChild(scripts[0]);
      }
      
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
