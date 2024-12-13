export const config = {
  runtime: 'experimental-edge'
};

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    const domain = searchParams.get('domain');
    
    if (!url || !domain) {
      return new Response(
        JSON.stringify({ error: 'Missing url or domain parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const path = new URL(url).pathname;
    
    // Fetch data from your database (replace this with your actual data fetching logic)
    const schemas = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Climber BI Ltd",
        // ... rest of the organization schema
      },
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Qlik Cloud Analytics",
        // ... rest of the product schema
      }
    ];
    
    // Convert schemas to script tags
    const schemaScripts = schemas.map(schema => 
      `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
    ).join('\n');
    
    return new Response(schemaScripts, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, s-maxage=3600',
      }
    });
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
