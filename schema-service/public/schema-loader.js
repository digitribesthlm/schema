(function() {
  const loadSchemas = async () => {
    try {
      const currentUrl = window.location.href;
      
      // Development testing URLs
      const testUrls = {
        '/qlik-cloud-analytics': 'product',
        '/': 'organization'
      };

      // Use development URL for local testing
      const schemaUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001/api/schema'
        : 'https://schema.climberbi.co.uk/api/schema';

      const response = await fetch(`${schemaUrl}?url=${encodeURIComponent(currentUrl)}`, {
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const schemas = await response.json();
      
      // Debug output in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Loaded schemas:', schemas);
      }

      // Remove any existing schema scripts
      document.querySelectorAll('script[data-schema-loader="true"]')
        .forEach(script => script.remove());

      // Inject schemas into head
      schemas.forEach(schema => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-schema-loader', 'true');
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });

    } catch (error) {
      console.error('Error loading schemas:', error);
    }
  };

  // Load schemas when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSchemas);
  } else {
    loadSchemas();
  }

  // Reload schemas on navigation for SPAs
  window.addEventListener('popstate', loadSchemas);
})(); 