(() => {
  const loadSchema = async () => {
    try {
      console.log('🚀 Schema loader starting...');
      
      const currentUrl = window.location.href;
      const domain = window.location.hostname;
      console.log('📍 Current page:', { 
        url: currentUrl,
        domain: domain 
      });

      // Use the current origin to determine the API URL
      const apiUrl = `${window.location.protocol}//${domain}/api/schema`;
      console.log('🔧 Using API URL:', apiUrl);
      
      const fullUrl = `${apiUrl}?url=${encodeURIComponent(currentUrl)}&domain=${domain}`;
      console.log('🔍 Fetching from:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html'
        }
      });
      
      console.log('📥 Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load schema: ${response.status} ${response.statusText}`);
      }
      
      const schemaHtml = await response.text();
      console.log('📦 Response size:', schemaHtml.length, 'characters');
      
      if (!schemaHtml) {
        console.log('⚠️ No schemas found for this page');
        return;
      }

      // Create a temporary container and set its HTML
      const temp = document.createElement('div');
      temp.innerHTML = schemaHtml;
      
      // Move each script tag to the head
      const scripts = temp.getElementsByTagName('script');
      const initialCount = scripts.length;
      console.log(`📑 Found ${initialCount} schema script tags`);
      
      if (initialCount === 0) {
        console.log('⚠️ No schema script tags found in response');
        return;
      }

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
            schemaType: content['@type'],
            name: content.name
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
      
      console.log(`✨ Successfully loaded ${addedCount} of ${initialCount} schemas`);
      
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
