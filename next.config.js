/** @type {import('next').NextConfig} */
const nextConfig = {
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
      { source: '/p/:handle', destination: '/profile/:handle', permanent: true },
      { source: '/v/:video_id', destination: '/video/:video_id', permanent: true },
      { source: '/q/:id', destination: '/question/:id', permanent: true },
    ]
  },
  // webpack(config, ) {},
}

module.exports = nextConfig
