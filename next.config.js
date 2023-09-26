/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'media.qa.begenuin.com' }],
  },
}

module.exports = nextConfig
