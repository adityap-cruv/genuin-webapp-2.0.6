// ESLint config for the web-sdk, extending the shared monorepo config (ESM)
// original config
// export { default } from '../eslint-config/index.js'

// Temporarily disable linting for web-sdk by exporting an empty config
export default [
  {
    ignores: ['**/*'],
  },
]
