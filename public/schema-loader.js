(() => {
  const loadSchema = async () => {
    try {
      const currentUrl = window.location.href;
      const domain = window.location.hostname;
      
      console.log('🔍 Loading schemas for:', { url: currentUrl, domain });
      
      // Get the schema domain from our own script src
      const scripts = document.getElementsByTagName('script');
      let schemaDomain = '';
      for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].src;
        if (src && src.includes('schema-loader.js')) {
          schemaDomain = new URL(src).origin;
          break;
        }
      }

      if (!schemaDomain) {
        throw new Error('Could not determine schema domain');
      }

      console.log('📡 Schema API domain:', schemaDomain);

      const apiUrl = `${schemaDomain}/api/schema`;
      const fullUrl = `${apiUrl}?url=${encodeURIComponent(currentUrl)}&domain=${domain}`;
      
      console.log('🌐 Fetching from:', fullUrl);
      
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
      console.log('📥 Received schema HTML:', schemaHtml);
      
      if (!schemaHtml) {
        console.log('⚠️ No schemas found');
        return;
      }

      // Create a temporary container
      const temp = document.createElement('div');
      temp.innerHTML = schemaHtml;
      
      // Process script tags
      const schemaScripts = temp.getElementsByTagName('script');
      console.log(`📊 Found ${schemaScripts.length} schemas`);
      
      while (schemaScripts.length > 0) {
        const script = schemaScripts[0];
        try {
          const newScript = document.createElement('script');
          newScript.type = 'application/ld+json';
          const content = JSON.parse(script.text);
          console.log('✅ Adding schema:', {
            type: content['@type'],
            name: content.name
          });
          newScript.textContent = JSON.stringify(content);
          document.head.appendChild(newScript);
        } catch (e) {
          console.error('❌ Failed to parse schema JSON:', e);
        }
        temp.removeChild(script);
      }

      // Log all ld+json scripts in head for verification
      const headScripts = document.head.getElementsByTagName('script');
      const ldJsonScripts = Array.from(headScripts).filter(s => s.type === 'application/ld+json');
      console.log(`✨ Total ld+json scripts in head: ${ldJsonScripts.length}`);
      ldJsonScripts.forEach((script, index) => {
        try {
          const content = JSON.parse(script.textContent);
          console.log(`Schema ${index + 1}:`, {
            type: content['@type'],
            name: content.name
          });
        } catch (e) {
          console.error(`Failed to parse schema ${index + 1}:`, e);
        }
      });
      
    } catch (error) {
      console.error('❌ Error loading schema:', error);
    }
  };

  // Load schema when DOM is ready
  if (document.readyState === 'loading') {
    console.log('⏳ Waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', loadSchema);
  } else {
    console.log('🚀 Page ready, loading schema now...');
    loadSchema();
  }
})();
