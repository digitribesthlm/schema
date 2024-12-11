import SchemaViewer from '../components/SchemaViewer';
import Head from 'next/head';

export default function QlikAutoML() {
  return (
    <div>
      <Head>
        <script src="/schema-loader.js" />
      </Head>
      <h1>Qlik AutoML</h1>
      <p>This is a test product page for Qlik AutoML that should load the AutoML product schema.</p>
      
      <SchemaViewer />
    </div>
  );
}