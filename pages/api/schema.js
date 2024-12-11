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
    if (!url) {
      console.error('No URL provided');
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    const domain = req.query.domain || new URL(url).hostname;
    console.log('Checking domain:', domain);
    if (!isAllowedDomain(domain)) {
      console.error('Domain not authorized:', domain);
      return res.status(403).json({ error: 'Domain not authorized' });
    }

    const path = new URL(url).pathname;
    const cacheKey = `${domain}:${path}`;
    console.log('Path:', path, 'Cache key:', cacheKey);
    
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log('Returning cached data');
      return res.json(cachedData);
    }
    
    const { db } = await connectToDatabase();
    const queryDomain = domain === 'localhost' ? 'www.climberbi.co.uk' : domain;
    console.log('Query domain:', queryDomain);

    const [orgSchema, productSchema] = await Promise.all([
      db.collection('organization-schemas').findOne({ domain: queryDomain, active: true }),
      db.collection('product-schemas').findOne({
        domain: queryDomain,
        active: true,
        $or: [{ 'metadata.pagePatterns': path }, { 'metadata.pagePatterns': `${path}/*` }]
      })
    ]);

    console.log('Found schemas:', { 
      hasOrgSchema: !!orgSchema, 
      hasProductSchema: !!productSchema 
    });

    const schemas = [
      productSchema && enhanceSchema(productSchema.schema),
      orgSchema && enhanceSchema(orgSchema.schema)
    ].filter(Boolean);

    const response = { schemas };
    cache.put(cacheKey, response, CACHE_DURATION);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type');
    res.setHeader('Cache-Control', 's-maxage=86400');
    
    return res.json(response);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}