/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  experimental: {
    serverActions: true,
    turbo: {
      resolveAlias: {
        // Optional: Add any alias configurations if needed
      }
    }
  }
};

export default nextConfig;