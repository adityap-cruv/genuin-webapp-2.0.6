# Genuin Webapp

Next.js web application for Genuin platform.

## Project Structure

```
webapp/
├── src/              # Source code
├── public/           # Static assets
├── components/       # React components
├── pages/           # Next.js pages
├── styles/          # Global styles
└── utils/           # Utility functions
```

## Prerequisites

- Node.js >= 18.17.0
- pnpm >= 8.0.0

## Environment Setup

This project uses different environment configurations for development, QA, and production. Follow these steps to set up your environment:

1. Copy the example environment files to create your local configurations:

   ```bash
   cp .env.development.example .env.development
   cp .env.qa.example .env.qa
   cp .env.production.example .env.production
   ```

2. Update the environment files with your specific values:

   - `.env.development`: Local development configuration
   - `.env.qa`: QA environment configuration
   - `.env.production`: Production environment configuration
   - `.env.common`: Shared configuration across all environments (already included in repository)

3. Environment Variables:

   Common Variables (`.env.common`, committed to repository):

   - `NEXT_PUBLIC_API_URL`: Base URL for API calls
   - `NEXT_PUBLIC_APP_URL`: Base URL for the web application
   - `NEXT_PUBLIC_SDK_VERSION`: Version of the web-sdk package
   - `NEXT_PUBLIC_ANALYTICS_ID`: Analytics tracking ID

   Environment-specific Variables (need to be configured locally):

   - `NODE_ENV`: Environment type ("development", "qa", "production")
   - `NEXT_PUBLIC_BASE_URL`: Base URL for the web application
   - `NEXT_PUBLIC_API_BASE_URL`: Base URL for API calls
   - `NEXT_PUBLIC_MEDIA_BASE_URL`: Base URL for media assets
   - `NEXT_PUBLIC_RUDDERSTACK_URL`: RudderStack analytics URL
   - `NEXT_PUBLIC_RUDDERSTACK_API_KEY`: RudderStack API key

4. Environment Validation:
   The project includes automatic environment validation that runs before builds and during development. If you see any validation errors:
   - Check that you have the correct environment file for your target environment
   - Ensure all required variables are properly set
   - Contact your team lead if you need the correct values for any environment
   - Run validation manually with: `pnpm validate:env`

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start development server:

   ```bash
   pnpm dev
   ```

3. Build for production:
   ```bash
   pnpm build
   ```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm validate:env` - Validate environment configuration
- `pnpm test` - Run tests

## Features

- Next.js 14
- TypeScript
- Tailwind CSS
- Radix UI Components
- React Query
- Authentication
- API Integration
- Web SDK Integration

## Development

### Local Development

1. Start the development server:

   ```bash
   pnpm dev
   ```

2. Open [http://localhost:4005](http://localhost:4005)

### Building

1. Build the application:

   ```bash
   pnpm build
   ```

2. Start the production server:
   ```bash
   pnpm start
   ```

## Testing

Run tests with:

```bash
pnpm test
```

## Troubleshooting

### Common Issues

1. **Build Failures**

   - Clear Next.js cache: `rm -rf .next`
   - Rebuild: `pnpm build`

2. **TypeScript Errors**

   - Run type checking: `pnpm typecheck`
   - Check for missing types

3. **Environment Issues**

   - Verify `.env` file exists
   - Check environment variables

4. **Dependency Issues**
   - Run `pnpm install`
   - Check for version conflicts

### Performance

- Use `next/image` for images
- Implement proper code splitting
- Monitor bundle size

## Deployment

The application is deployed using Jenkins. See the deployment documentation for details.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

ISC
