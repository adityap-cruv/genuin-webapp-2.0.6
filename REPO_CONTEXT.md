# Genuin Monorepo - Repository Context

This document provides essential context and information about the Genuin monorepo structure, technologies, and patterns. Use it as a reference for future GitHub Copilot chats to ensure consistent and contextually relevant responses.

## 1. Repository Structure

```
genuin-webapp-standalone/
├── apps/                        # Application packages
│   └── webapp/                  # Next.js web application
│       ├── src/                 # Source code
│       ├── public/              # Static assets
│       ├── config/              # Configuration files
│       └── scripts/             # Utility scripts
├── packages/                    # Shared packages and libraries
│   ├── components/              # Shared React components
│   ├── eslint-config/           # Shared ESLint configuration
│   ├── tailwind-config/         # Shared Tailwind CSS configuration
│   ├── typescript-config/       # Shared TypeScript configuration
│   ├── ui/                      # UI component library
│   ├── utils/                   # Shared utility functions
│   └── web-sdk/                 # Genuin Web SDK package
├── scripts/                     # Root-level utility scripts
├── pnpm-workspace.yaml          # pnpm workspace configuration
├── turbo.json                   # Turborepo configuration
└── package.json                 # Root package dependencies
```

## 2. Technology Stack

### Core Technologies
- **Package Manager**: pnpm v8.15.3+
- **Monorepo Tool**: Turborepo
- **Node.js Version**: v20.12.0+ (required for Next.js 15)
- **TypeScript**: v5.2.2+

### Frontend Framework
- **Next.js**: v15.0.0+
- **React**: v19.0.0+
- **Authentication**: NextAuth.js v5.0.0+
- **State Management**: Zustand, Immer
- **API Client**: TanStack Query v5
- **CSS**: Tailwind CSS, CSS Modules

### Web SDK
- **Build Tool**: Rollup v4
- **Framework**: React 19+
- **CSS Processing**: PostCSS with Tailwind CSS

### Development Tools
- **Linting**: ESLint with shared configurations
- **Formatting**: Prettier
- **Git Hooks**: Husky
- **Versioning**: pnpm workspace versioning
- **UI Development**: Storybook v8.6+

## 3. Project Organization

### Monorepo Structure
- **apps/***: Contains complete applications
- **packages/***: Contains shared libraries and utilities
- **Root Package**: Contains shared dependencies and workspace config

### Workspace Commands
- `pnpm dev`: Start all development servers
- `pnpm build`: Build all packages
- `pnpm lint`: Run linting across all packages
- `pnpm format`: Format code across all packages
- `pnpm components`: Run Storybook for UI components

### Project-Specific Commands
- See individual README files in each package
- Web SDK has special build commands for different environments

## 4. Key Architecture Patterns

### Web Application (Next.js 15)
- Uses App Router architecture
- Server Components with Client Components where needed
- Authentication via NextAuth.js v5
- API routes using Next.js Route Handlers
- Asset optimization through Next.js Image and Font components
- CSS modules with Tailwind CSS for styling

### Web SDK
- Standalone embeddable React application
- Built using Rollup with multiple environment configurations
- Includes analytics integration with RudderStack
- Supports multiple embedding methods (standard, carousel, feed)
- Version management through package.json

### Shared Components
- UI library with Storybook for development and testing
- Tailwind CSS for styling with consistent theme across projects
- TypeScript for type safety and developer experience

## 5. Recent Upgrades

### Next.js 15 and React 19 Upgrade
- Completed migration from Next.js 14 and React 18
- Includes React 19 component pattern updates (removal of React.FC)
- Uses Next.js 15's package import optimization
- Supports Server Components and Partial Prerendering (PPR)

### Monorepo Conversion
- Project was converted from standalone repositories to monorepo
- Git history preserved during conversion
- Workspace dependencies properly configured

## 6. Development Best Practices

### Code Style
- Use TypeScript for all new code
- Follow eslint configurations
- Use component patterns consistent with React 19
- Follow the existing folder structure patterns

### Dependencies
- Shared dependencies managed at root level
- Project-specific dependencies in respective package.json files
- Use workspace references (workspace:*) for internal dependencies

### Environment Setup
- Use nvm to manage Node.js versions
- Run `pnpm install` after pulling changes
- Clear Turborepo cache with `pnpm turbo clean` if build issues occur

### Testing
- Follow testing patterns in existing code
- Use React Testing Library for component tests
- Use Vitest for unit tests
- Use Storybook for component development and visual testing

## 7. Project-Specific Concerns

### Web SDK Versioning
- Development builds skip version management
- QA/Production builds prompt for version updates
- Versioning is managed through package.json

### Web Application Deployment
- Uses standard Next.js deployment patterns
- Supports edge runtime for certain API routes
- Includes Sentry for error monitoring
- Environment variables defined in .env files

## 8. Documentation
- Each package contains its own README with specific instructions
- UPGRADE_GUIDE.md contains details on Next.js 15 and React 19 upgrade
- MONOREPO_CONVERSION.md explains the repository structure conversion
- Additional documentation in markdown files at project root

---

**Note**: Use this document as context for Copilot chats about the Genuin monorepo. Always refer to the actual code and documentation for the most up-to-date information.
