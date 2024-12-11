import { connectToDatabase } from '../../utils/mongodb';
import cache from 'memory-cache';
import { enhanceSchema } from '../../utils/schemaEnhancer';

// Cache duration: 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;

const isAllowedDomain = (domain) => {
  if (process.env.NODE_ENV === 'development' && domain === 'localhost') return true;
  const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',').map(d => d.trim()) || [];
  return allowedDomains.some(d => domain === d || domain.endsWith(`.${d}`));
};

export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL parameter is required' });

    const domain = req.query.domain || new URL(url).hostname;
    if (!isAllowedDomain(domain)) return res.status(403).json({ error: 'Domain not authorized' });

    const path = new URL(url).pathname;
    const cacheKey = `${domain}:${path}`;
    
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);
    
    const { db } = await connectToDatabase();
    const queryDomain = domain === 'localhost' ? 'www.climberbi.co.uk' : domain;

    const [orgSchema, productSchema] = await Promise.all([
      db.collection('organization-schemas').findOne({ domain: queryDomain, active: true }),
      db.collection('product-schemas').findOne({
        domain: queryDomain,
        active: true,
        $or: [{ 'metadata.pagePatterns': path }, { 'metadata.pagePatterns': `${path}/*` }]
      })
    ]);

    const schemas = [
      productSchema && enhanceSchema(productSchema.schema),
      orgSchema && enhanceSchema(orgSchema.schema)
    ].filter(Boolean);

    const response = { schemas };
    cache.put(cacheKey, response, CACHE_DURATION);

    res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : `https://${domain}`);
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type');
    res.setHeader('Cache-Control', 's-maxage=86400');

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}