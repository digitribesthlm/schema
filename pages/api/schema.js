import { MongoClient } from 'mongodb';

// Only run MongoDB operations on the server
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, domain } = req.query;
  
  if (!url || !domain) {
    return res.status(400).json({ error: 'Missing url or domain parameter' });
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined');
    return res.status(500).json({ error: 'Database configuration error' });
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db();
    
    const path = new URL(url).pathname;
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
      
      // Extract just the schema content
      const schemaContents = schemas.map(doc => doc.schema);
      allSchemas = [...allSchemas, ...schemaContents];
    }
    
    res.setHeader('Cache-Control', 'public, s-maxage=3600');
    res.status(200).json(allSchemas);
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
}
