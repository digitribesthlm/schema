import { MongoClient } from 'mongodb';

export const config = {
  runtime: 'edge',
};

async function getMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Please add your Mongo URI to .env.local');
  const client = new MongoClient(uri);
  return client;
}

async function getSchemas(domain, path) {
  const client = await getMongoClient();
  
  try {
    await client.connect();
    const db = client.db('schema-db');
    
    // Get all relevant collections
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
      
      allSchemas = [...allSchemas, ...schemas];
    }
    
    return allSchemas.map(doc => doc.schema);
  } finally {
    await client.close();
  }
}

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
    const schemas = await getSchemas(domain, path);
    
    // Convert schemas to script tags
    const schemaScripts = schemas.map(schema => 
      `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
    ).join('\n');
    
    return new Response(schemaScripts, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800'
      }
    });
    
  } catch (error) {
    console.error('Schema API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
