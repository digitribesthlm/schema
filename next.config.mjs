// @ts-check

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  env: {
    ALLOWED_DOMAINS: process.env.ALLOWED_DOMAINS,
    SCHEMA_DOMAIN: process.env.SCHEMA_DOMAIN
  }
};

export default config;
