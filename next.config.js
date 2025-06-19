/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'plus.unsplash.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        port: '',
        pathname: '/**',
      }
    ]
  },
  webpack: (config, { isServer }) => {
    // Handle externals only on server
    if (isServer) {
      if (!config.externals) {
        config.externals = [];
      }
      config.externals.push('lightningcss');
    }
    return config;
  }
}

module.exports = nextConfig
