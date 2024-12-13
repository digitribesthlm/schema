(() => {
  const findScriptUrl = () => {
    // Try to find the script tag that loaded this file
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      const script = scripts[i];
      if (script.src && script.src.includes('schema-loader.js')) {
        return script;
      }
    }
    return null;
  };

  const loadSchema = async () => {
    try {
      console.log('🚀 Schema loader starting...');
      
      const currentUrl = window.location.href;
      const domain = window.location.hostname;
      console.log('📍 Current page:', { 
        url: currentUrl,
        domain: domain 
      });

      // Find the script element that loaded this file
      const scriptElement = findScriptUrl();
      if (!scriptElement) {
        throw new Error('Could not find schema loader script element');
      }

      const apiUrl = scriptElement.getAttribute('data-api-url');
      if (!apiUrl) {
        throw new Error('Schema API URL not configured. Add data-api-url attribute to the script tag.');
      }
      console.log('🔧 Using API URL:', apiUrl);
      
      const fullUrl = `${apiUrl}?url=${encodeURIComponent(currentUrl)}&domain=${domain}`;
      console.log('🔍 Fetching from:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load schema: ${response.status} ${response.statusText}`);
      }
      
      const schemaHtml = await response.text();
      
      if (!schemaHtml) {
        console.log('⚠️ No schemas found for this page');
        return;
      }

      // Create a temporary container
      const temp = document.createElement('div');
      temp.innerHTML = schemaHtml;
      
      // Process script tags
      const scripts = temp.getElementsByTagName('script');
      console.log(`📑 Found ${scripts.length} schema script tags`);
      
      let addedCount = 0;
      while (scripts.length > 0) {
        const script = scripts[0];
        try {
          // Create a new script element
          const newScript = document.createElement('script');
          newScript.type = 'application/ld+json';
          
          // Parse and validate the JSON
          const content = JSON.parse(script.text);
          console.log('✅ Adding schema:', {
            type: script.type,
            schemaType: content['@type']
          });
          
          // Set the content and add to head
          newScript.textContent = JSON.stringify(content, null, 2);
          document.head.appendChild(newScript);
          addedCount++;
        } catch (e) {
          console.error('❌ Failed to parse schema JSON:', e);
        }
        // Remove from temp container
        temp.removeChild(script);
      }
      
      console.log(`✨ Successfully loaded ${addedCount} schemas`);
      
    } catch (error) {
      console.error('❌ Error loading schema:', error);
    }
  };

  // Load schema when DOM is ready
  if (document.readyState === 'loading') {
    console.log('🔄 Waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', loadSchema);
  } else {
    console.log('📄 Page ready, loading schema now...');
    loadSchema();
  }
})();
