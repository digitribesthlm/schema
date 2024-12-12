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
    const { url, domain, format } = req.query;
    
    console.log('📥 Schema request:', {
      url,
      domain,
      format,
      headers: req.headers
    });

    // Forward to data domain
    const dataUrl = `https://data.digigrowth.se/api/schema?url=${encodeURIComponent(url)}&domain=${domain}&format=${format}`;
    console.log('🔄 Forwarding to:', dataUrl);
    
    const response = await fetch(dataUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html'
      }
    });

    console.log('📤 Data response:', {
      status: response.status,
      statusText: response.statusText
    });

    const data = await response.text();
    
    // Set same headers as original response
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(data);
    
  } catch (error) {
    console.error('❌ Schema API error:', error);
    res.status(500).json({ error: error.message });
  }
}