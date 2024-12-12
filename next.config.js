const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SCHEMA_API_URL: process.env.NEXT_PUBLIC_SCHEMA_API_URL,
    ALLOWED_DOMAINS: process.env.ALLOWED_DOMAINS,
    SCHEMA_DOMAIN: process.env.SCHEMA_DOMAIN
  },
  webpack: (config) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        '__SCHEMA_API_URL__': JSON.stringify(process.env.NEXT_PUBLIC_SCHEMA_API_URL)
      })
    );
    return config;
  }
};

module.exports = nextConfig;
