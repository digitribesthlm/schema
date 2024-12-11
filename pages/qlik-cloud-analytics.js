import Head from 'next/head';

export default function QlikCloudAnalytics() {
  return (
    <div>
      <Head>
        <script src="/schema-loader.js" />
      </Head>
      <h1>Qlik Cloud Analytics</h1>
      <p>This is a test product page that should load the product schema.</p>
      <pre id="schema-output"></pre>
    </div>
  );
}

// Add script to print schema in the background
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const schemaOutput = document.getElementById('schema-output');
    const schemas = JSON.parse(localStorage.getItem('schema_cache'))?.schemas || [];
    schemaOutput.textContent = JSON.stringify(schemas, null, 2);
  });
}