import Head from 'next/head';

export default function QlikAutoML({ schemas }) {
  return (
    <pre>{JSON.stringify(schemas, null, 2)}</pre>
  );
}

export async function getServerSideProps({ req }) {
  try {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = req.headers.host;
    const url = `${protocol}://${host}/api/schema?url=${encodeURIComponent(`${protocol}://${host}/qlik-automl`)}&domain=${host}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    const data = await response.json();
    
    return {
      props: {
        schemas: data.schemas || []
      }
    };
  } catch (error) {
    console.error('Error fetching schema:', error);
    return {
      props: {
        schemas: []
      }
    };
  }
}