(() => {
  const loadSchema = async () => {
    try {
      const currentUrl = window.location.href;
      const domain = window.location.hostname;
      
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

      const apiUrl = `${schemaDomain}/api/schema`;
      const fullUrl = `${apiUrl}?url=${encodeURIComponent(currentUrl)}&domain=${domain}`;
      
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
        return;
      }

      // Create a temporary container
      const temp = document.createElement('div');
      temp.innerHTML = schemaHtml;
      
      // Process script tags
      const schemaScripts = temp.getElementsByTagName('script');
      
      while (schemaScripts.length > 0) {
        const script = schemaScripts[0];
        try {
          const newScript = document.createElement('script');
          newScript.type = 'application/ld+json';
          const content = JSON.parse(script.text);
          newScript.textContent = JSON.stringify(content, null, 2);
          document.head.appendChild(newScript);
        } catch (e) {
          console.error('Failed to parse schema JSON:', e);
        }
        temp.removeChild(script);
      }
      
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
