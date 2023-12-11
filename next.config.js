/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'media.qa.begenuin.com' }],
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      { source: '/qt/:question_id', destination: '/q/:question_id', permanent: true },
      { source: '/rt/:loop_id', missing: [{ type: 'query', key: 'v' }], destination: '/l/:loop_id', permanent: true },
      // These redirects are for new design implementation and slug.
      { source: '/c/:handle', destination: '/app/community/:handle', permanent: true },
      { source: '/l/:loop_id', destination: '/app/loop/:loop_id', permanent: true },
      { source: '/p/:handle', destination: '/app/profile/:handle', permanent: true },
      { source: '/v/:video_id', destination: '/app/video/:video_id', permanent: true },
      { source: '/q/:id', destination: '/app/question/:id', permanent: true },
    ]
  },
}

module.exports = nextConfig
