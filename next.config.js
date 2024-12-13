/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SCHEMA_API_URL: process.env.NEXT_PUBLIC_SCHEMA_API_URL
  },
  experimental: {
    runtime: 'experimental-edge'
  }
};

module.exports = nextConfig;
