/**
 * Enhances schemas with additional Schema.org properties
 */
export function enhanceSchema(schema) {
  if (!schema || !schema['@type']) return schema;

  switch (schema['@type']) {
    case 'SoftwareApplication':
      return enhanceSoftwareSchema(schema);
    case 'Organization':
      return enhanceOrganizationSchema(schema);
    default:
      return schema;
  }
}

function enhanceSoftwareSchema(schema) {
  return {
    ...schema,
    operatingSystem: schema.operatingSystem || "Web",
    offers: enhanceOffers(schema.offers),
    applicationCategory: schema.applicationCategory || "Business Intelligence Software",
    // Add aggregateRating if available
    ...(schema.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        "ratingValue": schema.rating.value,
        "ratingCount": schema.rating.count
      }
    })
  };
}

function enhanceOffers(offers) {
  if (!offers) return undefined;
  
  return {
    "@type": "Offer",
    ...offers,
    // Add standard offer properties if not present
    "availability": offers.availability || "https://schema.org/InStock",
    "price": offers.price || offers.description || "Contact for pricing",
    "priceCurrency": offers.priceCurrency || "GBP"
  };
}

function enhanceOrganizationSchema(schema) {
  return {
    ...schema,
    // Add standard organization properties if not present
    "url": schema.url || schema.provider?.url,
    ...(schema.address && {
      "address": {
        "@type": "PostalAddress",
        ...schema.address
      }
    })
  };
}
