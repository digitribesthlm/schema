/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SCHEMA_API_URL: process.env.NEXT_PUBLIC_SCHEMA_API_URL,
    ALLOWED_DOMAINS: process.env.ALLOWED_DOMAINS,
    SCHEMA_DOMAIN: process.env.SCHEMA_DOMAIN
  }
};

module.exports = nextConfig;
