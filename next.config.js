/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SCHEMA_API_URL: process.env.NEXT_PUBLIC_SCHEMA_API_URL,
  },
  publicRuntimeConfig: {
    schemaApiUrl: process.env.NEXT_PUBLIC_SCHEMA_API_URL,
    schemaDomain: process.env.SCHEMA_DOMAIN
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
      };
    }
    return config;
  },
}

module.exports = nextConfig;
