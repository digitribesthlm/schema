import Head from 'next/head';

export default function QlikAutoML({ schemas }) {
  return (
    <div>
      <Head>
        <script src="/schema-loader.js" />
      </Head>
      <pre id="schema-output">{JSON.stringify(schemas, null, 2)}</pre>
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