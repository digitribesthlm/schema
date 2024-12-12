(() => {
  const loadSchema = async () => {
    try {
      console.log('🚀 Schema loader starting...');
      
      const currentUrl = window.location.href;
      const domain = window.location.hostname;
      console.log('📍 Current page:', { url: currentUrl, domain });
      
      // Use the production API URL
      const apiUrl = 'https://data.digigrowth.se/api/schema';
      const fullUrl = `${apiUrl}?url=${encodeURIComponent(currentUrl)}&domain=${domain}&format=html`;
      
      console.log('🔍 Fetching schemas from:', fullUrl);
      console.log('📡 Request details:', {
        method: 'GET',
        headers: {
          'Accept': 'text/html',
          'Origin': window.location.origin
        }
      });
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html',
          'Origin': window.location.origin
        },
        credentials: 'omit'
      });
      
      console.log('📥 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Failed to load schema: ${response.status} ${response.statusText}`);
      }
      
      const schemaHtml = await response.text();
      console.log('📦 Response content length:', schemaHtml.length);
      
      if (!schemaHtml) {
        console.log('⚠️ No schemas found for this page');
        return;
      }

      // Create a temporary container and set its HTML
      const temp = document.createElement('div');
      temp.innerHTML = schemaHtml;
      
      // Move each script tag to the head
      const scripts = temp.getElementsByTagName('script');
      console.log(`📑 Found ${scripts.length} schema script tags`);
      
      if (scripts.length === 0) {
        console.log('⚠️ No schema script tags found in response');
        return;
      }

      while (scripts.length > 0) {
        const script = scripts[0];
        document.head.appendChild(script);
        console.log('✅ Added schema to page:', {
          type: script.type,
          content: script.text.substring(0, 100) + '...'
        });
      }
      
      console.log(`✨ Successfully loaded ${scripts.length} schema(s)`);
    } catch (error) {
      console.error('❌ Error loading schema:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
  };

  // Load schema when DOM is ready
  if (document.readyState === 'loading') {
    console.log('🔄 Page loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', loadSchema);
  } else {
    console.log('📄 Page ready, loading schema now...');
    loadSchema();
  }
})();
