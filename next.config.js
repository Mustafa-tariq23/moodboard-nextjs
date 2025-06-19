/** @type {import('next').NextConfig} */
const nextConfig = {
  // ...existing config...
  experimental: {
    // ...existing experimental config...
    turbo: {
      resolveAlias: {
        // Resolve LightningCSS binary for different platforms
        'lightningcss-linux-x64-gnu': 'lightningcss-linux-x64-gnu',
        'lightningcss-darwin-x64': 'lightningcss-darwin-x64',
        'lightningcss-darwin-arm64': 'lightningcss-darwin-arm64',
        'lightningcss-win32-x64-msvc': 'lightningcss-win32-x64-msvc',
      },
    },
  },
  // Add webpack configuration to handle native modules
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('lightningcss');
    }
    return config;
  },
  images: {
    domains: [
      'images.unsplash.com',
      'plus.unsplash.com'
    ],
    // Alternative: use remotePatterns for more control
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
}

module.exports = nextConfig
