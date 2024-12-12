import { connectToDatabase } from '../../utils/mongodb';
import cache from 'memory-cache';
import { enhanceSchema } from '../../utils/schemaEnhancer';

// Cache duration: 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;

const isAllowedDomain = (domain) => {
  // Strip port number if present
  const domainWithoutPort = domain.split(':')[0];
  
  if (process.env.NODE_ENV === 'development' && domainWithoutPort === 'localhost') {
    return true;
  }
  
  const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',').map(d => d.trim()) || [];
  return allowedDomains.some(d => 
    domainWithoutPort === d || 
    domainWithoutPort.endsWith(`.${d}`)
  );
};

export default async function handler(req, res) {
  try {
    console.log('API Request:', {
      query: req.query,
      headers: req.headers,
      env: {
        allowedDomains: process.env.ALLOWED_DOMAINS,
        schemaDomain: process.env.SCHEMA_DOMAIN,
        nodeEnv: process.env.NODE_ENV
      }
    });

    const { url } = req.query;
    if (!url) {
      console.error('No URL provided');
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Always strip port from domain
    const domain = (req.query.domain || new URL(url).hostname).split(':')[0];
    console.log('Checking domain:', domain);
    
    if (!isAllowedDomain(domain)) {
      console.error('Domain not authorized:', domain);
      return res.status(403).json({ error: 'Domain not authorized' });
    }

    const path = new URL(url).pathname;
    const cacheKey = `${domain}:${path}`;
    console.log('Path:', path, 'Cache key:', cacheKey);
    
    // Clear cache for debugging
    cache.clear();
    
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log('Returning cached data');
      return res.json(cachedData);
    }
    
    const { db } = await connectToDatabase();
    // Always use SCHEMA_DOMAIN for querying MongoDB
    const queryDomain = process.env.SCHEMA_DOMAIN;
    
    console.log('Query domain for MongoDB:', queryDomain);

    // Log the MongoDB query parameters
    console.log('MongoDB Query Params:', {
      orgQuery: { domain: queryDomain, active: true },
      productQuery: {
        domain: queryDomain,
        active: true,
        $or: [{ 'metadata.pagePatterns': path }, { 'metadata.pagePatterns': `${path}/*` }]
      }
    });

    const [orgSchema, productSchema] = await Promise.all([
      db.collection('organization-schemas').findOne({ domain: queryDomain, active: true }),
      db.collection('product-schemas').findOne({
        domain: queryDomain,
        active: true,
        $or: [{ 'metadata.pagePatterns': path }, { 'metadata.pagePatterns': `${path}/*` }]
      })
    ]);

    // Log all schemas in the collections for debugging
    console.log('All Organization Schemas:', await db.collection('organization-schemas').find({}).toArray());
    console.log('All Product Schemas:', await db.collection('product-schemas').find({}).toArray());

    console.log('MongoDB results:', {
      hasOrgSchema: !!orgSchema,
      hasProductSchema: !!productSchema,
      orgSchemaDomain: orgSchema?.domain,
      productSchemaDomain: productSchema?.domain,
      path,
      queryDomain
    });

    const schemas = [
      productSchema && enhanceSchema(productSchema.schema),
      orgSchema && enhanceSchema(orgSchema.schema)
    ].filter(Boolean);

    const response = { schemas };
    cache.put(cacheKey, response, CACHE_DURATION);

    // If HTML format is requested, return just the schema script tags
    if (req.query.format === 'html') {
      const schemaHtml = schemas.map(schema => 
        `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/html');
      return res.send(schemaHtml);
    }

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