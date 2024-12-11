(function() {
  const loadSchemas = async () => {
    try {
      const currentUrl = window.location.href;
      console.log('Loading schemas for:', currentUrl);

      const response = await fetch(`/api/schema?url=${encodeURIComponent(currentUrl)}`);
      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { schemas } = await response.json();
      console.log('Received schemas:', schemas);

      // Remove existing schemas
      document.querySelectorAll('script[type="application/ld+json"]')
        .forEach(script => script.remove());

      // Add new schemas
      schemas.forEach(schema => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
        console.log('Injected schema:', schema['@type']);
      });

    } catch (error) {
      console.error('Schema loader error:', error);
    }
  };

  // Load when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSchemas);
  } else {
    loadSchemas();
  }
})(); 