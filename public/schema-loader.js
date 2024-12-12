(() => {
  const loadSchema = async () => {
    try {
      const currentUrl = window.location.href;
      const domain = window.location.hostname;
      
      // Use the production API URL
      const apiUrl = 'https://data.digigrowth.se/api/schema';
      const fullUrl = `${apiUrl}?url=${encodeURIComponent(currentUrl)}&domain=${domain}&format=html`;
      
      console.log('Loading schema from:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html',
          'Origin': window.location.origin
        },
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load schema: ${response.status} ${response.statusText}`);
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
      if (scripts.length === 0) {
        console.log('No schema script tags found in response');
        return;
      }

      while (scripts.length > 0) {
        document.head.appendChild(scripts[0]);
      }
      
      console.log(`Successfully loaded ${scripts.length} schema(s)`);
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
