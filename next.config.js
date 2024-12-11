/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    schemaApiUrl: process.env.NEXT_PUBLIC_SCHEMA_API_URL,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'mongodb': false,
      };
    }
    return config;
  },
}

module.exports = nextConfig;