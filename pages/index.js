import { useEffect, useState } from 'react';

export default function Home() {
  const [schemas, setSchemas] = useState([]);

  useEffect(() => {
    // Get schemas from the head on client-side
    const scripts = document.head.getElementsByTagName('script');
    const foundSchemas = Array.from(scripts)
      .filter(script => script.type === 'application/ld+json')
      .map(script => {
        try {
          return JSON.parse(script.textContent);
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
    
    setSchemas(foundSchemas);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Current Page Schemas</h1>
      
      <div className="space-y-4">
        {schemas.map((schema, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded">
            <div className="font-semibold">Type: {schema['@type']}</div>
            {schema.name && (
              <div>Name: {schema.name}</div>
            )}
            <pre className="mt-2 bg-white p-2 rounded text-sm overflow-x-auto">
              {JSON.stringify(schema, null, 2)}
            </pre>
          </div>
        ))}
        
        {schemas.length === 0 && (
          <p className="text-gray-500">No schemas found for this page.</p>
        )}
      </div>
    </div>
  );
}
