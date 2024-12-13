import '../styles/globals.css';

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
  if (!ctx.req) {
    return { schemas: [] };
  }

  try {
    // Get the full URL and domain from the request
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const domain = ctx.req.headers.host;
    const path = ctx.pathname || '/';
    
    // Fetch schemas from our API
    const apiUrl = `${protocol}://${domain}/api/schema?url=${encodeURIComponent(path)}&domain=${domain}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }
    
    const schemas = await response.json();
    return { schemas };
  } catch (error) {
    console.error('Error fetching schemas:', error);
    return { schemas: [] };
  }
};

export default MyApp;
