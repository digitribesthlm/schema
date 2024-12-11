import SchemaViewer from '../components/SchemaViewer';
import { useEffect } from 'react';
import { loadSchemas } from '../utils/schemaLoader';

export default function QlikAutoML() {
  useEffect(() => {
    loadSchemas();
  }, []);

  return (
    <div>
      <h1>Qlik AutoML</h1>
      <p>This is a test product page for Qlik AutoML that should load the AutoML product schema.</p>
      
      <SchemaViewer />
    </div>
  );
}