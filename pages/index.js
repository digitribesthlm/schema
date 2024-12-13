export default function Home() {
  // Get all ld+json scripts from head
  const getSchemas = () => {
    if (typeof window !== 'undefined') {
      const scripts = document.head.getElementsByTagName('script');
      const schemas = Array.from(scripts)
        .filter(script => script.type === 'application/ld+json')
        .map(script => {
          try {
            return JSON.parse(script.textContent);
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);
      return schemas;
    }
    return [];
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Schema Manager</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="text-xl font-semibold mb-2">Current Page Schemas</h2>
        <p className="text-sm text-gray-600 mb-4">
          These schemas are injected during server-side rendering and are visible to search engines:
        </p>
        
        <div className="space-y-4">
          {getSchemas().map((schema, index) => (
            <div key={index} className="bg-white p-4 rounded shadow">
              <div className="font-semibold text-blue-600">
                Type: {schema['@type']}
              </div>
              {schema.name && (
                <div className="text-gray-600">
                  Name: {schema.name}
                </div>
              )}
              <pre className="mt-2 bg-gray-50 p-2 rounded text-sm overflow-x-auto">
                {JSON.stringify(schema, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-500">
        <p>Note: Schemas are loaded from MongoDB based on:</p>
        <ul className="list-disc list-inside ml-4">
          <li>Current domain</li>
          <li>Page URL patterns</li>
          <li>Active status</li>
        </ul>
      </div>
    </div>
  );
}
