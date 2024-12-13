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
    
    // Example schemas (replace with your MongoDB fetch)
    const schemas = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Climber BI Ltd"
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
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Accept'
      }
    });
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
