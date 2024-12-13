import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  try {
    const url = req.query.url;
    const domain = req.query.domain;
    
    if (!url || !domain) {
      return res.status(400).json({ error: 'Missing url or domain parameter' });
    }

    const path = new URL(url).pathname;
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
      
      res.status(200).json(allSchemas);
      
    } finally {
      await client.close();
    }
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
