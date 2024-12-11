import Head from 'next/head';

export default function QlikCloudAnalytics({ schemas }) {
  return (
    <pre>{JSON.stringify(schemas, null, 2)}</pre>
  );
}

export async function getServerSideProps({ req }) {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const url = `${protocol}://${req.headers.host}/api/schema?url=${protocol}://${req.headers.host}/qlik-cloud-analytics&domain=${req.headers.host}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  return {
    props: data
  };
}