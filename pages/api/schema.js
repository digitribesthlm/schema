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

const matchesPagePattern = (url, patterns) => {
  if (!patterns || !Array.isArray(patterns)) return false;
  const pathname = new URL(url).pathname;
  return patterns.some(pattern => {
    if (pattern === '*') return true;
    if (pattern.endsWith('/*')) {
      const base = pattern.slice(0, -2);
      return pathname.startsWith(base);
    }
    return pathname === pattern;
  });
};

export default async function handler(req, res) {
  try {
    const { url, domain } = req.query;
    
    if (!url || !domain) {
      throw new Error('URL and domain are required parameters');
    }

    console.log('📥 Schema request:', {
      url,
      domain,
      headers: req.headers
    });

    if (!isAllowedDomain(domain)) {
      throw new Error('Domain not allowed');
    }

    // Check cache first
    const cacheKey = `${domain}:${url}`;
    const cachedSchemas = cache.get(cacheKey);
    if (cachedSchemas) {
      console.log('📦 Returning cached schemas');
      return res.status(200).send(cachedSchemas);
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    // Collections to query
    const collections = [
      'organization-schemas',
      'product-schemas',
      'service-schemas'
    ];

    // Query all collections for matching schemas
    const matchingSchemas = [];
    
    for (const collection of collections) {
      const schemas = await db.collection(collection)
        .find({
          domain: domain,
          active: true
        })
        .toArray();

      // Filter schemas by page patterns
      const matching = schemas.filter(schema => 
        matchesPagePattern(url, schema.metadata?.pagePatterns)
      );

      matchingSchemas.push(...matching);
    }

    if (matchingSchemas.length === 0) {
      console.log('⚠️ No matching schemas found');
      return res.status(200).send('');
    }

    // Convert schemas to HTML script tags
    const schemaHtml = matchingSchemas
      .map(doc => {
        const schema = enhanceSchema ? enhanceSchema(doc.schema) : doc.schema;
        return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
      })
      .join('\n');

    // Cache the result
    cache.put(cacheKey, schemaHtml, CACHE_DURATION);

    console.log(`✨ Returning ${matchingSchemas.length} schemas`);
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(schemaHtml);
    
  } catch (error) {
    console.error('❌ Schema API error:', error);
    res.status(500).json({ error: error.message });
  }
}
