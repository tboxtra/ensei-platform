/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: ['@ensei/shared-types', '@ensei/api-client'],
}

module.exports = nextConfig
