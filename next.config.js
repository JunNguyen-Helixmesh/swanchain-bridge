const path = require('path');
const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';
const envFile = path.join(__dirname, `.env.${env}`);

dotenv.config({ path: envFile });

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // env variables
  },
};

module.exports = nextConfig;