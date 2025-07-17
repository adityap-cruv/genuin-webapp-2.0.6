/**
 * @fileoverview Next.js HTTP Headers Configuration Module
 *
 * This module manages the HTTP response headers for the Genuin Web Application,
 * implementing security best practices for different environments (local, QA, production).
 *
 * The headers defined here help protect against common web vulnerabilities including:
 * - Cross-Site Scripting (XSS)
 * - Clickjacking
 * - MIME-type confusion attacks
 * - Cross-Site Request Forgery (CSRF)
 * - Information disclosure
 * - Mixed content issues
 *
 * @module headers
 * @requires process.env - Environment variables
 */

// Environment detection
const ENV = process.env.NEXT_PUBLIC_CURRENT_ENV || 'local'
const isDev = ENV === 'local'
const isProd = ENV === 'prod'

/**
 * Environment-specific host configurations
 *
 * These host URLs are used in header definitions to ensure proper connectivity
 * between the application and various services in different environments.
 * Using environment variables allows for flexibility in deployment configurations.
 *
 * @type {Object} HOSTS - Collection of environment-specific endpoints
 */
const HOSTS = {
  /**
   * API server endpoint - Uses environment variable if set,
   * otherwise falls back to environment-specific defaults
   */
  api: process.env.NEXT_PUBLIC_API_URL || (isProd ? 'https://api.begenuin.com' : 'https://api.qa.begenuin.com'),

  /**
   * Rudderstack analytics endpoint - Used for user event tracking
   */
  rudder:
    process.env.NEXT_PUBLIC_RUDDERSTACK_URL ||
    (isProd ? 'https://rudderstack.begenuin.com' : 'https://rudderstack.qa.begenuin.com'),

  /**
   * Media server endpoint - Used for serving user-generated content
   */
  media: 'https://*.begenuin.com',

  /**
   * Amazon S3 bucket endpoints - Used for media storage
   * Production uses us-east-1 region while QA uses us-west-2
   */
  s3Media: isProd
    ? 'https://genuin-media.s3.us-east-1.amazonaws.com'
    : 'https://genuin-qa-media.s3.us-west-2.amazonaws.com',

  /**
   * Brand community endpoints - Used for embedded content
   */
  brandsHost:
    process.env.NEXT_PUBLIC_BCC_URL || (isProd ? 'https://brands.begenuin.com' : 'https://brands.qa.begenuin.com'),
  sentry: 'https://sentry.begenuin.com',
  ssai: isProd
    ? 'https://5815062334624ad3879ad30b8c92b7d7.mediatailor.us-east-1.amazonaws.com'
    : 'https://9ec5df27fc5b48c3abc1fde4c81a87d5.mediatailor.us-west-2.amazonaws.com',
  bunnyCDN: isProd ? 'https://vz-8bbc7bbf-a1e.b-cdn.net' : 'https://vz-eee5e913-a30.b-cdn.net',
}

/**
 * Header Configuration Function
 *
 * This function generates the HTTP headers configuration for the Next.js application.
 * It implements various security headers based on OWASP best practices and
 * adapts the configuration based on the current environment.
 *
 * Security headers implemented:
 * - Content-Security-Policy (CSP): Controls allowed sources for various resource types
 * - X-Frame-Options: Controls how the site can be embedded in iframes
 * - X-Content-Type-Options: Prevents MIME type sniffing
 * - X-XSS-Protection: Legacy browser protection against XSS
 * - Strict-Transport-Security (HSTS): Forces HTTPS connections
 * - Referrer-Policy: Controls information shared in the Referer header
 * - Permissions-Policy: Controls access to browser features
 *
 * @function getHeaders
 * @async
 * @returns {Promise<Array>} Array of header configurations for Next.js
 * @see https://nextjs.org/docs/advanced-features/security-headers
 * @see https://owasp.org/www-project-secure-headers/
 */
async function getHeaders() {
  return [
    // Minimal headers for authentication API endpoints
    {
      source: '/api/auth(.*)',
      headers: [
        // Include a minimal, permissive header for auth endpoints
        { key: 'Access-Control-Allow-Credentials', value: 'true' },
      ],
    },
    {
      /**
       * Apply these headers to all routes in the application
       * The '(.*)' pattern matches any path in the application
       */
      source: '/((?!api/auth).*)',
      headers: [
        /**
         * X-Frame-Options Header
         *
         * Controls whether the page can be displayed in a frame, iframe, embed, or object.
         * ALLOW-FROM restricts the page to be displayed in a frame on the specified origin.
         * This is primarily for legacy browser support (IE) as modern browsers use frame-ancestors in CSP.
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
         */
        { key: 'X-Frame-Options', value: `ALLOW-FROM ${HOSTS.brandsHost}` },

        /**
         * Content-Security-Policy (CSP) Header
         *
         * A critical security header that helps prevent XSS and data injection attacks.
         * It specifies which dynamic resources are allowed to load based on source domain.
         *
         * The policy is constructed by joining multiple directives with semicolons.
         * Each directive controls a specific type of resource (scripts, styles, images, etc.)
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
         * @see https://content-security-policy.com/
         */
        {
          key: 'Content-Security-Policy',
          value: [
            // default
            "default-src 'self' https:",

            // scripts: self + CDNs + (dev-only HMR/eval)
            [
              "script-src 'self'",
              'https://cdn.rudderlabs.com',
              'https://cdn.jsdelivr.net',
              'https://*.begenuin.com',
              'https://*.vercel-insights.com',
              ...(isDev
                ? ["'unsafe-inline'", "'unsafe-eval'", 'http://localhost:*', 'ws://localhost:*']
                : ["'unsafe-inline'", "'unsafe-eval'"]),
            ].join(' '),

            // styles: self + inline + dev HMR
            [
              "style-src 'self' 'unsafe-inline'",
              'https://*.begenuin.com',
              'https://fonts.googleapis.com',
              ...(isDev ? ['http://localhost:*', 'ws://localhost:*'] : []),
            ].join(' '),

            // images
            `img-src 'self' data: blob: ${HOSTS.media} ${HOSTS.bunnyCDN} https://*.picsum.photos https://picsum.photos`,

            // media (video/audio)
            `media-src 'self' data: blob: ${HOSTS.media} ${HOSTS.ssai} ${HOSTS.bunnyCDN}`,

            `font-src 'self' data: blob: ${HOSTS.media} ${HOSTS.bunnyCDN}`,

            // XHR/fetch/WebSocket
            [
              "connect-src 'self'",
              ...(isDev ? ['http://localhost:*', 'ws://localhost:*'] : []),
              'https://api.rudderstack.com',
              'https://*.begenuin.com',
              HOSTS.api,
              HOSTS.rudder,
              HOSTS.media,
              HOSTS.s3Media,
              HOSTS.sentry,
              HOSTS.ssai,
              HOSTS.bunnyCDN,
              // Self is sufficient for NextAuth endpoints since they're on the same origin
            ].join(' '),

            // web workers
            [
              "worker-src 'self' blob:",
              ...(isDev ? ['http://localhost:*', 'ws://localhost:*'] : []),
              'https://cdn.rudderlabs.com',
              'https://cdn.jsdelivr.net',
            ].join(' '),

            // forms
            `form-action 'self' ${HOSTS.api}`,

            // framing
            `frame-ancestors 'self' ${HOSTS.brandsHost}${isDev ? ' http://localhost:*' : ''}`,

            // upgrade/block mixed (QA+Prod only)
            ...(isDev ? [] : ['upgrade-insecure-requests', 'block-all-mixed-content']),
          ].join('; '),
        },

        /**
         * X-Content-Type-Options Header
         *
         * Prevents browsers from MIME-sniffing a response away from the declared content-type.
         * This reduces exposure to drive-by downloads and helps prevent XSS attacks.
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
         */
        { key: 'X-Content-Type-Options', value: 'nosniff' },

        /**
         * X-XSS-Protection Header
         *
         * Legacy header that enables some XSS protections built into older browsers.
         * Modern browsers rely on CSP instead, but this provides an extra layer of defense.
         * The '1; mode=block' setting stops the page from loading when an XSS attack is detected.
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection
         */
        { key: 'X-XSS-Protection', value: '1; mode=block' },

        /**
         * HTTP Strict Transport Security (HSTS) Header
         *
         * Enforces secure (HTTPS) connections to the server.
         * Only applied in non-development environments to avoid local development issues.
         *
         * Settings:
         * - max-age=31536000: Enforce HTTPS for one year (in seconds)
         * - includeSubDomains: Apply policy to all subdomains
         * - preload: Allow inclusion in browser preload lists
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
         */
        ...(!isDev
          ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' }]
          : []),

        /**
         * Referrer-Policy Header
         *
         * Controls how much referrer information is included with requests.
         * strict-origin-when-cross-origin:
         * - Sends full URL when navigating within the same origin
         * - Sends only the origin when navigating to a different origin
         * - Sends nothing when navigating from HTTPS to HTTP
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
         */
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

        /**
         * Permissions-Policy Header
         *
         * Controls which browser features and APIs can be used in the application.
         * Empty parentheses mean the feature is disabled completely.
         *
         * This configuration disables access to potentially sensitive browser features
         * to reduce the attack surface and prevent potential privacy issues.
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
         * @see https://w3c.github.io/webappsec-permissions-policy/
         */
        {
          key: 'Permissions-Policy',
          value:
            'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
        },
      ],
    },
  ]
}

module.exports = getHeaders
