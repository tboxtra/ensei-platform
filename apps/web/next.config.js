/** @type {import("next").NextConfig} */
const nextConfig = {
    // Standalone configuration for Vercel deployment
    generateBuildId: async () => {
        // Force new build ID to bust cache
        return `build-${Date.now()}`;
    },
    // Disable static optimization for dynamic pages
    experimental: {
        esmExternals: false,
    },
    // Disable ESLint during build for production deployment
    eslint: {
        ignoreDuringBuilds: true,
    },
}

module.exports = nextConfig
