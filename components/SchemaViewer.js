import { useEffect, useState } from 'react';

export default function SchemaViewer() {
  const [schemas, setSchemas] = useState([]);
  const [debug, setDebug] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    let mounted = true;

    const handleSchemaLoaded = (event) => {
      if (!mounted) return;
      checkForSchemas();
    };

    const handleSchemaError = (event) => {
      if (!mounted) return;
      setError(event.detail.message);
      setLoading(false);
    };

    const handleSchemaDebug = (event) => {
      if (!mounted) return;
      setDebug(event.detail.debug || []);
    };

    const getSchemas = () => {
      try {
        const schemaScripts = document.querySelectorAll('script[data-schema-loader="true"]');
        if (!schemaScripts || schemaScripts.length === 0) {
          console.log('No schema scripts found yet');
          return [];
        }

        return Array.from(schemaScripts)
          .sort((a, b) => {
            return parseInt(a.getAttribute('data-schema-index')) - 
                   parseInt(b.getAttribute('data-schema-index'));
          })
          .map((script, index) => {
            try {
              return JSON.parse(script.textContent);
            } catch (e) {
              console.error(`Error parsing schema ${index}:`, e);
              return { error: `Invalid JSON in schema ${index}: ${e.message}` };
            }
          });
      } catch (e) {
        console.error('Error accessing DOM:', e);
        setError(`Failed to access schema scripts: ${e.message}`);
        return [];
      }
    };

    const checkForSchemas = () => {
      try {
        const foundSchemas = getSchemas();
        if (foundSchemas.length > 0) {
          setSchemas(foundSchemas);
          setLoading(false);
        }
      } catch (e) {
        console.error('Error checking schemas:', e);
        setError(`Failed to check schemas: ${e.message}`);
        setLoading(false);
      }
    };

    // Listen for schema events
    window.addEventListener('schemaLoaded', handleSchemaLoaded);
    window.addEventListener('schemaError', handleSchemaError);
    window.addEventListener('schemaDebug', handleSchemaDebug);

    // Initial check
    checkForSchemas();

    // Set timeout for initial load
    const timeout = setTimeout(() => {
      if (mounted && schemas.length === 0) {
        setError('Timeout: No schemas loaded after 5 seconds');
        setLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      window.removeEventListener('schemaLoaded', handleSchemaLoaded);
      window.removeEventListener('schemaError', handleSchemaError);
      window.removeEventListener('schemaDebug', handleSchemaDebug);
    };
  }, [schemas.length]);

  if (error) {
    return (
      <div style={{ 
        margin: '20px 0', 
        padding: '20px', 
        background: '#fff3f3', 
        border: '1px solid #ffcdd2',
        borderRadius: '4px' 
      }}>
        <h2 style={{ color: '#d32f2f' }}>Error Loading Schemas:</h2>
        <pre style={{ color: '#d32f2f' }}>{error}</pre>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ margin: '20px 0', padding: '20px' }}>
        Loading schemas... (checking for injected schemas)
      </div>
    );
  }

  return (
    <div style={{ margin: '20px 0', padding: '20px', background: '#f5f5f5' }}>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setShowDebug(!showDebug)}
          style={{
            padding: '8px 16px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
        </button>
      </div>

      <h2>Current Page Schemas: {schemas.length > 0 ? `(${schemas.length} found)` : '(None found)'}</h2>
      {schemas.length === 0 ? (
        <p style={{ color: '#666' }}>No schemas currently loaded for this page.</p>
      ) : (
        schemas.map((schema, index) => (
          <div key={index}>
            <h3>Schema {index + 1}:</h3>
            <pre style={{ 
              margin: '10px 0',
              padding: '15px',
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              {JSON.stringify(schema, null, 2)}
            </pre>
          </div>
        ))
      )}

      {showDebug && debug.length > 0 && (
        <div style={{ marginTop: '20px', borderTop: '2px solid #ddd', paddingTop: '20px' }}>
          <h3>Debug Log:</h3>
          {debug.map((entry, index) => (
            <div 
              key={index}
              style={{
                margin: '10px 0',
                padding: '10px',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <div style={{ color: '#666', fontSize: '0.9em' }}>
                {entry.timestamp}
              </div>
              <div style={{ fontWeight: 'bold' }}>
                {entry.message}
              </div>
              {entry.data && (
                <pre style={{ 
                  margin: '5px 0 0 0',
                  padding: '10px',
                  background: '#f8f9fa',
                  fontSize: '0.9em',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(entry.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 