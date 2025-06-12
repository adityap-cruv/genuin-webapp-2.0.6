/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // === Stable Next.js 15 root-level options ===
  // External packages for Server Components
  serverExternalPackages: [],

  // === Turbopack config (root-level, not experimental) ===
  turbopack: {
    rules: {
      // ...existing code...
    },
    resolveAlias: {
      // ...existing code...
    },
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json', '.css', '.scss', '.svg'],
  },

  // === Images ===
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.qa.begenuin.com' },
      { protocol: 'https', hostname: 'media.begenuin.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // === Redirects ===
  async redirects() {
    return [
      { source: '/qt/:question_id', destination: '/q/:question_id', permanent: true },
      { source: '/rt/:loop_id', missing: [{ type: 'query', key: 'v' }], destination: '/l/:loop_id', permanent: true },
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

  // === Webpack config for SVGs (for Next.js 15, not Turbopack) ===
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack', 'url-loader'],
    })
    // Sync aliases with packages/components/tsconfig.json
    const path = require('path')
    config.resolve.alias = {
      ...config.resolve.alias,
      '@components': path.resolve(__dirname, '../../packages/components/src/components'),
      '@templates': path.resolve(__dirname, '../../packages/components/src/templates'),
      '@pages': path.resolve(__dirname, '../../packages/components/src/page'),
      '@organisms': path.resolve(__dirname, '../../packages/components/src/organisms'),
      '@molecules': path.resolve(__dirname, '../../packages/components/src/molecules'),
      '@atoms': path.resolve(__dirname, '../../packages/components/src/atoms'),
      '@react-query': path.resolve(__dirname, '../../packages/components/src/react-query'),
      '@types': path.resolve(__dirname, '../../packages/components/src/types'),
      '@context': path.resolve(__dirname, '../../packages/components/src/context'),
    }
    return config
  },

  // === Experimental options (only stable/documented) ===
  experimental: {
    webpackBuildWorker: true,
    optimizeCss: true,
    // serverMinification is useful for faster dev builds
    serverMinification: process.env.NODE_ENV !== 'development',
    serverActions: {
      bodySizeLimit: '2mb',
    },

    // Cache revalidation times for client-side router
    staleTimes: {
      dynamic: 30,
      static: 180,
    },

    // Package imports to optimize
    optimizePackageImports: [
      '@genuin/ui',
      '@genuin/components',
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

    // Enable Partial Prerendering for production
    ppr: process.env.NODE_ENV === 'production',

    // React Compiler for production builds
    reactCompiler: process.env.NODE_ENV === 'production',

    // Enable view transitions for smooth page navigation
    viewTransition: true,
  },
}

// Development-specific tweaks
if (process.env.NODE_ENV === 'development' && process.env.NEXT_TURBO) {
  nextConfig.turbopack = {
    ...nextConfig.turbopack,
  }
}

module.exports = nextConfig
