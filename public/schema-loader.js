(() => {
  const CACHE_KEY = 'schema_cache';
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  const getCachedSchema = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { timestamp, data, url } = JSON.parse(cached);
      
      // Check if cache is still valid
      if (Date.now() - timestamp < CACHE_DURATION && url === window.location.href) {
        console.log('📦 Using cached schema');
        return data;
      }
      
      return null;
    } catch (error) {
      console.warn('⚠️ Cache read error:', error);
      return null;
    }
  };

  const setCachedSchema = (data) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        url: window.location.href,
        data
      }));
    } catch (error) {
      console.warn('⚠️ Cache write error:', error);
    }
  };

  const injectSchemas = (schemaHtml) => {
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
    
    console.log(`✨ Successfully loaded ${addedCount} of ${initialCount} schemas`);
  };

  const loadSchema = async () => {
    try {
      console.log('🚀 Schema loader starting...');
      
      // Try to get cached schema first
      const cachedSchema = getCachedSchema();
      if (cachedSchema) {
        injectSchemas(cachedSchema);
        return;
      }
      
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

      // Cache the response
      setCachedSchema(schemaHtml);
      
      // Inject the schemas
      injectSchemas(schemaHtml);
      
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
