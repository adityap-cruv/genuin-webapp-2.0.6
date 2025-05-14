# Genuin Monorepo

This monorepo contains the Genuin web application and SDK packages, managed using Turborepo and pnpm workspaces.

## Project Structure

```
genuin/
├── apps/
│   └── webapp/           # Next.js web application
├── packages/
│   └── web-sdk/         # React-based SDK package
├── package.json         # Root package.json with shared dependencies
├── pnpm-workspace.yaml  # Workspace configuration
├── turbo.json          # Turborepo configuration
└── .gitignore          # Root .gitignore
```

## Prerequisites

- Node.js >= 18.17.0
- pnpm >= 8.0.0
- Git

## Getting Started

1. Install dependencies:

   ```bash
   npm install  # or yarn install
   ```

2. **Configure your local environment:**

   For local development, you can create a `.env.local` file to override environment variables:

   ```bash
   # Copy the example file to .env.local
   cp .env.local.example .env.local

   # Edit the file as needed
   nano .env.local
   ```

   Important environment variables:

   - `MIDDLEWARE_OVERRIDE_HOST`: Set this to override the host used in middleware.

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. Start development servers:

   ```bash
   pnpm dev
   ```

5. Build all packages:
   ```bash
   pnpm build
   ```

## Monorepo Management

### Workspace Commands

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages
- `pnpm lint` - Run linting across all packages
- `pnpm format` - Format code across all packages

### Project-Specific Commands

Each project has its own set of commands. See their respective README files for details:

- [Webapp Commands](./apps/webapp/README.md)
- [Web SDK Commands](./packages/web-sdk/README.md)

## Shared Configuration

The monorepo uses shared configurations for:

- ESLint (`.eslintrc.js`)
- Prettier (`.prettierrc`)
- TypeScript (base config)
- Git Hooks (Husky)

## Dependencies

Shared dependencies are managed at the root level. Project-specific dependencies are managed in their respective `package.json` files.

## Troubleshooting

### Common Issues

1. **Dependency Conflicts**

   - Run `pnpm install` to resolve conflicts
   - Check for version mismatches in `package.json` files

2. **Build Failures**

   - Clear Turborepo cache: `pnpm turbo clean`
   - Rebuild: `pnpm build`

3. **TypeScript Errors**

   - Run `pnpm typecheck` to check for type errors
   - Ensure all dependencies are properly typed

4. **Workspace Issues**
   - Run `pnpm install` to update workspace dependencies
   - Check `pnpm-workspace.yaml` for correct configuration

### Environment Setup

1. **Node Version**

   ```bash
   node -v  # Should be >= 18.17.0
   ```

2. **pnpm Version**

   ```bash
   pnpm -v  # Should be >= 8.0.0
   ```

3. **Git Hooks**
   ```bash
   pnpm prepare  # Install Git hooks
   ```

## Development Workflow

1. **Starting Development**

   ```bash
   pnpm install
   pnpm dev
   ```

2. **Making Changes**

   - Create feature branches from `main`
   - Follow conventional commits
   - Run tests before pushing

3. **Building for Production**
   ```bash
   pnpm build
   ```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

ISC
