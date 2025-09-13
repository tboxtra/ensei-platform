/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 14, no need for experimental flag
  basePath: process.env.NODE_ENV === 'production' ? '/admin' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/admin' : '',
  trailingSlash: true,
  output: 'standalone'
}

module.exports = nextConfig
