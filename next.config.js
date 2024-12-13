/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    ALLOWED_DOMAINS: process.env.ALLOWED_DOMAINS,
    SCHEMA_DOMAIN: process.env.SCHEMA_DOMAIN
  }
};

module.exports = nextConfig;
