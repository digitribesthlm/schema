export async function loadSchemas() {
  try {
    // Dispatch debug event
    window.dispatchEvent(new CustomEvent('schemaDebug', {
      detail: {
        debug: [{
          timestamp: new Date().toISOString(),
          message: 'Starting schema load',
          data: { url: window.location.href }
        }]
      }
    }));

    // Fetch schemas from our API
    const response = await fetch(`/api/schema?url=${encodeURIComponent(window.location.href)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const { schemas } = await response.json();

    // Remove any existing schema scripts
    document.querySelectorAll('script[data-schema-loader="true"]').forEach(script => script.remove());

    // Inject each schema as a script tag
    schemas.forEach((schema, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-schema-loader', 'true');
      script.setAttribute('data-schema-index', index.toString());
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    // Dispatch success event
    window.dispatchEvent(new CustomEvent('schemaLoaded', {
      detail: { count: schemas.length }
    }));

    // Dispatch final debug event
    window.dispatchEvent(new CustomEvent('schemaDebug', {
      detail: {
        debug: [{
          timestamp: new Date().toISOString(),
          message: 'Schema load complete',
          data: { count: schemas.length }
        }]
      }
    }));

  } catch (error) {
    console.error('Schema loading error:', error);
    
    // Dispatch error event
    window.dispatchEvent(new CustomEvent('schemaError', {
      detail: { message: error.message }
    }));

    // Dispatch error debug event
    window.dispatchEvent(new CustomEvent('schemaDebug', {
      detail: {
        debug: [{
          timestamp: new Date().toISOString(),
          message: 'Schema load failed',
          data: { error: error.message }
        }]
      }
    }));
  }
}
