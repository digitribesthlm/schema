import SchemaViewer from '../components/SchemaViewer';
import { useEffect } from 'react';
import { loadSchemas } from '../utils/schemaLoader';

export default function QlikCloudAnalytics() {
  useEffect(() => {
    loadSchemas();
  }, []);

  return (
    <div>
      <h1>Qlik Cloud Analytics</h1>
      <p>This is a test product page that should load the product schema.</p>
      
      <SchemaViewer />
    </div>
  );
}