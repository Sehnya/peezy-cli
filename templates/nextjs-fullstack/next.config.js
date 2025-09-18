/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["postgres"],
  },
};

module.exports = nextConfig;
