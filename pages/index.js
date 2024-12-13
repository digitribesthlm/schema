export default function Home() {
  const schemaLoaderUrl = process.env.NEXT_PUBLIC_SCHEMA_LOADER_URL;
  const schemaApiUrl = process.env.NEXT_PUBLIC_SCHEMA_API_URL;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Schema Loader Integration</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Integration Instructions</h2>
        <p className="mb-4">Add the following script tag to your website&apos;s HTML:</p>
        
        <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto">
          {`<script 
  src="${schemaLoaderUrl}" 
  data-api-url="${schemaApiUrl}"
  async
></script>`}
        </pre>
        
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Important Notes:</h3>
          <ul className="list-disc list-inside">
            <li>Add the script to the <code>&lt;head&gt;</code> section of your HTML</li>
            <li>The <code>data-api-url</code> attribute is required</li>
            <li>The script automatically loads schemas for the current page</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
