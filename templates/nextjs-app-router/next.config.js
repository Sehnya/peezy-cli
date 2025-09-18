/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: [],
  },
  // Enable strict mode for better development experience
  reactStrictMode: true,
  // Enable SWC minification for better performance
  swcMinify: true,
  // Enable standalone output for Docker
  output: 'standalone',
  // Optimize bundle analyzer
  webpack: (config, { dev, isServer }) => {
    // Optimize for development
    if (dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }
    return config
  },
}

module.exports = nextConfig
