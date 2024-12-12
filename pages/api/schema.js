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
    
    const { db } = await connectToDatabase();
    
    // Only use the exact domain from the request
    console.log('Looking for schemas with domain:', domain);

    const [orgSchema, productSchema] = await Promise.all([
      db.collection('organization-schemas').findOne({
        domain: domain,
        active: true
      }),
      db.collection('product-schemas').findOne({
        domain: domain,
        active: true,
        'metadata.pagePatterns': path
      })
    ]);

    // Log what we found
    console.log('Found schemas:', {
      orgSchema: orgSchema ? { domain: orgSchema.domain, active: orgSchema.active } : null,
      productSchema: productSchema ? { 
        domain: productSchema.domain, 
        active: productSchema.active, 
        patterns: productSchema.metadata?.pagePatterns,
        path: path
      } : null
    });

    const schemas = [
      productSchema && enhanceSchema(productSchema.schema),
      orgSchema && enhanceSchema(orgSchema.schema)
    ].filter(Boolean);

    console.log('Returning schemas:', schemas.length);

    const response = { schemas };
    cache.put(cacheKey, response, CACHE_DURATION);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    res.setHeader('Cache-Control', 's-maxage=86400');

    // If HTML format is requested, return just the schema script tags
    if (req.query.format === 'html') {
      const schemaHtml = schemas.map(schema => 
        `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/html');
      return res.send(schemaHtml);
    }
    
    return res.json(response);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}