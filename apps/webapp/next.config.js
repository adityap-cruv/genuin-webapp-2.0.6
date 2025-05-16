/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Next.js 15 and React 19 features enabled
  experimental: {
    // typedRoutes disabled for Turbopack compatibility
    // typedRoutes: false,
    webpackBuildWorker: true,
    serverActions: {
      bodySizeLimit: '2mb',
    },
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    optimizePackageImports: [
      '@radix-ui/react-accordion',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'lucide-react',
      'react-icons/ai',
      'react-icons/bi',
      'react-icons/fi',
      'react-icons/hi',
      'react-icons/md',
      'date-fns',
      'react-hook-form',
    ],
    // Turbopack configuration for optimized development experience
    turbo: {
      // Enable Turbopack-specific optimizations
      resolveAlias: {
        // Add any required module aliases here if needed
      },
      // Configure rules for Turbopack (beta feature)
      rules: {
        // Example: Adjust processing for specific file types
      },
    },

    // React Compiler (alpha) - Uncomment for production builds
    // reactCompiler: process.env.NODE_ENV === 'production',

    // Partial Prerendering (beta) - Uncomment to enable
    // ppr: false,
  },

  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    resolveAlias: {},
    // Simplified rules for Turbopack compatibility
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.qa.begenuin.com' },
      { protocol: 'https', hostname: 'media.begenuin.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      { source: '/qt/:question_id', destination: '/q/:question_id', permanent: true },
      { source: '/rt/:loop_id', missing: [{ type: 'query', key: 'v' }], destination: '/l/:loop_id', permanent: true },
      // These redirects are for new design implementation and slug.
      { source: '/c/:handle', destination: '/community/:handle', permanent: true },
      { source: '/l/:loop_id', destination: '/loop/:loop_id', permanent: true },
      { source: '/loop/:loop_id', destination: '/group/:loop_id', permanent: true },
      { source: '/p/:handle', destination: '/profile/:handle', permanent: true },
      { source: '/v/:video_id', destination: '/video/:video_id', permanent: true },
      { source: '/q/:id', destination: '/question/:id', permanent: true },
    ]
  },
  /**
   * HTTP Headers Configuration
   *
   * This method imports and applies the HTTP security headers defined in the headers.js module.
   * Security headers protect against common web vulnerabilities like XSS, clickjacking, etc.
   *
   * @see /config/headers.js for detailed documentation on each security header
   * @returns {Promise<Array>} Array of header configurations in Next.js format
   */
  async headers() {
    // Import headers configuration from separate file using dynamic import
    const getHeaders = require('./config/headers.js')
    return getHeaders()
  },
  // webpack(config, ) {},
}

// In development, just use the standard Next.js config without Sentry
module.exports = nextConfig
