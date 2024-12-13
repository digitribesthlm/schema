import '../styles/globals.css';
import { MongoClient } from 'mongodb';

async function getSchemas(domain, path) {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db();
    
    const collections = ['organization-schemas', 'product-schemas', 'service-schemas'];
    let allSchemas = [];
    
    for (const collection of collections) {
      const schemas = await db.collection(collection)
        .find({
          domain: domain,
          active: true,
          $or: [
            { 'metadata.pagePatterns': '*' },
            { 'metadata.pagePatterns': path },
            { 'metadata.pagePatterns': { $regex: path.replace('*', '.*') } }
          ]
        })
        .toArray();
      
      allSchemas = [...allSchemas, ...schemas.map(doc => doc.schema)];
    }
    
    return allSchemas;
  } finally {
    await client.close();
  }
}

function MyApp({ Component, pageProps, schemas = [] }) {
  return (
    <>
      {/* Inject schemas into head */}
      {schemas.map((schema, index) => (
        <script 
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ 
            __html: JSON.stringify(schema) 
          }}
        />
      ))}
      <Component {...pageProps} />
    </>
  );
}

// This gets called on every request
MyApp.getInitialProps = async ({ ctx }) => {
  // Get the full URL and domain from the request
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const domain = ctx.req ? ctx.req.headers.host : window.location.hostname;
  const path = ctx.pathname || '/';
  
  let schemas = [];
  
  if (ctx.req) {
    // Only fetch schemas server-side
    try {
      schemas = await getSchemas(domain, path);
    } catch (error) {
      console.error('Error fetching schemas:', error);
    }
  }
  
  return { schemas };
};

export default MyApp;
