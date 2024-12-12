import Head from 'next/head';

export default function QlikCloudAnalytics() {
  return null;
}

export async function getServerSideProps({ req }) {
  try {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = req.headers.host;
    const url = `${protocol}://${host}/api/schema?url=${encodeURIComponent(`${protocol}://${host}/qlik-cloud-analytics`)}&domain=${host}&format=html`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const html = await response.text();
    return {
      props: {
        schemaHtml: html
      }
    };
  } catch (error) {
    console.error('Error fetching schema:', error);
    return {
      props: {
        schemaHtml: ''
      }
    };
  }
}