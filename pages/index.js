import SchemaViewer from '../components/SchemaViewer';
import { useEffect } from 'react';
import { loadSchemas } from '../utils/schemaLoader';

export default function Home() {
  useEffect(() => {
    loadSchemas();
  }, []);

  return (
    <div>
      <h1>Home Page</h1>
      <p>This page should load the organization schema.</p>
      <a href="/qlik-cloud-analytics">Go to Product Page</a>
      
      <SchemaViewer />
    </div>
  );
}
