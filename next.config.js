/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders }) => {
    // Note: we provide webpack above so you should not `require` it
    config.resolve.modules.push(path.resolve('./'))
    return config
  }
};

module.exports = nextConfig;