import { getDb } from '../../utils/mongodb';

export default async function handler(req, res) {
  try {
    const { url } = req.query;
    const path = new URL(url).pathname;
    
    const db = await getDb();
    
    // Check if there's a product schema for this path
    const productSchema = await db.collection('product-schemas').findOne({
      domain: 'www.climberbi.co.uk',
      active: true,
      $or: [
        { 'metadata.pagePatterns': path },
        { 'metadata.pagePatterns': `${path}/*` }
      ]
    });

    if (productSchema) {
      res.json({ schemas: [productSchema.schema] });
      return;
    }

    // If no product schema found, return organization schema
    const orgSchema = await db.collection('organization-schemas').findOne({
      domain: 'www.climberbi.co.uk',
      active: true
    });

    res.json({ schemas: orgSchema ? [orgSchema.schema] : [] });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}