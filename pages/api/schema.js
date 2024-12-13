export const config = {
  runtime: 'nodejs'  // Changed from edge to nodejs to support MongoDB
};

import { MongoClient } from 'mongodb';

async function getSchemas(domain, path) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Query all relevant collections
    const collections = ['organization-schemas', 'product-schemas', 'service-schemas'];
    let allSchemas = [];
    
    for (const collection of collections) {
      console.log(`Querying collection: ${collection}`);
      console.log(`Looking for domain: ${domain}, path: ${path}`);
      
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
      
      console.log(`Found ${schemas.length} schemas in ${collection}`);
      
      // Extract just the schema content from each document
      const schemaContents = schemas.map(doc => doc.schema);
      allSchemas = [...allSchemas, ...schemaContents];
    }
    
    return allSchemas;
  } catch (error) {
    console.error('MongoDB Error:', error);
    throw error;
  } finally {
    await client.close();
    console.log('Closed MongoDB connection');
  }
}

export default async function handler(req, res) {
  try {
    const url = req.query.url;
    const domain = req.query.domain;
    
    if (!url || !domain) {
      return res.status(400).json({ error: 'Missing url or domain parameter' });
    }

    console.log('Processing request for:', { url, domain });

    const path = new URL(url).pathname;
    const schemas = await getSchemas(domain, path);
    
    console.log(`Found ${schemas.length} total schemas`);
    
    // Convert schemas to script tags
    const schemaScripts = schemas.map(schema => 
      `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
    ).join('\n');
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Accept');
    res.setHeader('Cache-Control', 'public, s-maxage=3600');
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(schemaScripts);
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
