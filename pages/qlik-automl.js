import SchemaViewer from '../components/SchemaViewer';
import Head from 'next/head';

export default async function QlikAutoML({ schemas }) {
  return (
    <div>
      <Head>
        <script src="/schema-loader.js" />
      </Head>
      <pre id="schema-output"></pre>
      <SchemaViewer schema={schemas} />
    </div>
  );
}

export async function getServerSideProps({ req }) {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const url = `${protocol}://${req.headers.host}/api/schema?url=${protocol}://${req.headers.host}/qlik-automl&domain=${req.headers.host}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  return {
    props: data
  };
}