# Genuin Monorepo Instructions for GitHub Copilot

You are assisting with the Genuin monorepo project. When answering questions or providing code examples, consider the following context:

### Repository Structure and Purpose

This is a Next.js and React monorepo organized with Turborepo and pnpm workspaces. The project contains a main web application and a Web SDK package that share the same underlying component architecture despite having different delivery methods. The webapp is served via Next.js, while the web-sdk is packaged as a single JavaScript SDK for embedding.

Both applications reuse shared UI primitives and business components from the `packages/ui` and `packages/components` folders, ensuring consistent behavior and appearance across delivery formats.

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
```

### Technology Stack

- **Next.js**: v15.0.0+ with App Router
- **React**: v19.0.0+
- **TypeScript**: v5.2.2+
- **Node.js**: v20.12.0+
- **Package Manager**: pnpm v8.15.3+
- **Authentication**: NextAuth.js v5.0.0+
- **State Management**: React Context API (preferred), Zustand (limited use)
- **API Client**: TanStack Query v5
- **CSS**: Tailwind CSS v4, CSS Modules
- **Testing**: React Testing Library, Vitest
- **UI Development**: Storybook v8.6+

### Environment Variable Management (Apps & Packages)

- **Centralized Env Management**: Shared env variables are defined in the root `.env` file. App- and package-specific overrides can be placed in their respective `.env` files (e.g., `apps/webapp/.env`). Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

- **Injecting Env Vars in Apps with `env-cmd`**: Apps use [`env-cmd`](https://www.npmjs.com/package/env-cmd) to inject environment variables from the root `.env` into their runtime. Example (`apps/webapp/package.json`):

  ```json
  "scripts": {
    "dev": "env-cmd -f ../../.env next dev -p 4005"
  }
  ```

  This ensures all apps receive the same env context, avoiding duplication and drift.

- **Injecting Env Vars in Packages (Vite/Storybook)**: Shared packages (like `@genuin/components`, `@genuin/ui`) use Vite and Storybook for development and documentation. These packages inject env variables for Storybook via the `define` property in the `viteFinal` config in `.storybook/main.ts`:

  ```ts
  viteFinal: (config) => {
    return {
      ...config,
      define: {
        ...config.define,
        "import.meta.env.NEXT_PUBLIC_RUDDERSTACK_KEY": JSON.stringify(
          process.env.NEXT_PUBLIC_RUDDERSTACK_KEY
        ),
        "import.meta.env.NEXT_PUBLIC_RUDDERSTACK_URL": JSON.stringify(
          process.env.NEXT_PUBLIC_RUDDERSTACK_URL
        ),
        "import.meta.env.NEXT_PUBLIC_MEDIA_BASE_URL": JSON.stringify(
          process.env.NEXT_PUBLIC_MEDIA_BASE_URL
        ),
        "import.meta.env.NEXT_PUBLIC_HOST_URL": JSON.stringify(
          process.env.NEXT_PUBLIC_HOST_URL
        ),
      },
    };
  };
  ```

  This allows Storybook stories and Vite builds in packages to access the same env variables as the main app, ensuring consistency across the monorepo.

- **Best Practices**:
  - Add new shared envs to the root `.env` and document them in `.env.example`.
  - Use `env-cmd` in all scripts that start apps to ensure env consistency.
  - For Storybook, update the `define` block in `.storybook/main.ts` to expose any new public envs needed for stories.
  - Never commit secrets; use `.env.local` for local overrides.

- **Example: Adding a New Public Env Variable**
  1. Add to root `.env` and `.env.example`:
     ```
     NEXT_PUBLIC_NEW_FEATURE_FLAG=true
     ```
  2. Reference in your code as `process.env.NEXT_PUBLIC_NEW_FEATURE_FLAG` (Node) or `import.meta.env.NEXT_PUBLIC_NEW_FEATURE_FLAG` (Vite/Storybook).
  3. If needed in Storybook, add to the `define` block in `.storybook/main.ts`.

---

This approach ensures all apps and packages in the monorepo have a consistent, secure, and maintainable environment variable setup, both in development and in Storybook.

### Code Standards and Patterns

#### TypeScript & General Patterns

1. Follow TypeScript best practices with strict typing
   - Use explicit return types for functions with complex logic
   - Prefer types
   - Use proper generics to create reusable components and utilities
   - Define strict prop types for all components
2. File organization
   - Follow existing folder and file structure patterns
   - Use barrel exports (index.ts files) for cleaner imports
   - Organize by feature rather than type when appropriate
3. Package management
   - Use pnpm workspace dependencies (workspace:\*) for internal packages
   - Keep dependencies up to date and consistent across packages
4. Atomic Design Pattern
   - Follow React atomic design principles throughout the project
   - Organize components by their atomic design level:
     - **Atoms**: Basic UI primitives (buttons, inputs, etc.) in the UI package
     - **Molecules**: Simple combinations of atoms with limited functionality
     - **Organisms**: Complex UI components composed of multiple molecules and atoms
     - **Templates**: Page layouts without specific content
     - **Pages**: Complete views with real content and data
   - Ensure clear separation between primitive components (UI package) and business-specific components (Components package)
   - Follow progressive composition from atoms to pages

#### Tailwind CSS v4 Patterns

1. CSS and PostCSS Configuration
   - Use `@tailwind` directives in globals.css for compatibility
   - Use `@config '../../tailwind.config.ts'` directive in globals.css to specify the config file path
   - Configure PostCSS to use `@tailwindcss/postcss` plugin
   - Follow the gradual migration approach documented in TAILWIND_V4_MIGRATION_GUIDE.md
2. Theme Configuration and Usage
   - The project uses a hybrid approach compatible with both Tailwind v3 and v4
   - CSS variables are defined in the Tailwind theme and accessed via utility classes
   - Currently using `@import "tailwindcss"` along with `@config '../../tailwind.config.ts'` in globals.css
   - Use proper color opacity syntax: `bg-primary/[0.5]` instead of `bg-primary/50`
   - Configure CSS variables in the root element rather than using theme() function
3. Utility Class Renaming
   - Be aware of renamed utilities:
     - `shadow-sm` → `shadow-xs`
     - `shadow` → `shadow-sm`
     - `rounded-sm` → `rounded-xs`
     - `rounded` → `rounded-sm`
     - `outline-none` → `outline-hidden`
     - `ring` → `ring-3`
4. Custom Utilities
   - Use `@utility` directive for custom utilities instead of `@layer utilities`
   - Follow the new variant stacking order (left to right) when combining variants
   - Example: Change `first:*:pt-0` to `*:first:pt-0`
5. Migration References
   - Refer to TAILWIND_V4_MIGRATION.md for migration status
   - Follow TAILWIND_V4_MIGRATION_GUIDE.md for gradual transition steps
   - Use hybrid approaches where needed to maintain compatibility

#### React & Next.js Patterns

1. Use modern React 19 patterns
   - Functional components without React.FC type
   - Proper typing of useRef (e.g., useRef<HTMLDivElement>(null))
   - Prefer Server Components where possible
   - Use Client Components only when needed (especially for interactivity)
   - Prefer composition over inheritance for component reuse
   - Use React.use() hook for data fetching and promise handling
   - Take advantage of React 19's automatic batching of state updates
   - Use React.cache() for memoized server functions
   - Leverage React 19's improved error boundaries and error handling
   - Use the new useOptimistic hook for optimistic UI updates
   - Take advantage of Actions and useFormStatus for form interactions
   - Implement useFormState for easier form state management
   - Utilize useTransition for smoother UI updates during state changes
2. State management
   - Use React hooks for component-level state
   - Use React Context API as the primary solution for global state management
   - Only use Zustand as a last resort when Context becomes too complex
   - Use TanStack Query for server state management
3. Component design
   - Design components with clear responsibilities
   - Implement proper prop interfaces with optional props
   - Use compound components pattern for complex UI
   - Implement proper error boundaries for client components
4. Next.js App Router and Next.js 15 Optimizations
   - Follow Route Groups pattern for organization
   - Use proper fetch caching strategies with revalidation
   - Implement loading UI and error handling for each route
   - Use Metadata API for SEO optimizations
   - Implement Partial Prerendering (PPR) for hybrid static/dynamic pages
   - Use Next.js 15's optimizePackageImports for improved bundle sizes
   - Leverage server actions for form submissions and data mutations
   - Implement on-demand Incremental Static Regeneration (ISR)
   - Use View Transitions API for smoother page transitions
   - Enable Turbopack for faster development experience
   - Configure proper staleTimes for client-side router cache optimization
   - Utilize the React Compiler for automatic component optimization
   - Implement async params and searchParams handling (Next.js 15's improved async API)
   - Follow proper route handler caching configurations
   - Apply proper fetch caching settings for optimal performance
5. Server vs. Client Component usage
   - Default to Server Components unless interactivity is needed
   - Add "use client" directive at the top of client component files
   - Import client components into server components, not vice versa
   - Don't use useState/useEffect in Server Components
   - Create clear component boundaries between server and client rendering
   - Use the "progressive enhancement" approach - start with server components and add client components only where needed
   - Implement proper suspense boundaries around dynamic content
   - Consider performance implications when choosing between server and client components
   - For SEO-critical pages, ensure all important content is server-rendered
   - Apply hydration strategies that minimize client-side JavaScript while maintaining interactivity
   - Always prioritize Server-Side Rendering (SSR) for better SEO performance
     - Use Server Components for content that needs to be indexed by search engines
     - Implement proper metadata using Next.js Metadata API in each route
     - Ensure critical SEO elements (titles, descriptions, Open Graph data) are server-rendered
     - Use structured data (JSON-LD) where appropriate for enhanced search results
   - Follow proper server/client component architecture:
     - Keep data fetching in server components whenever possible
     - Only use client components when interactivity is required (event handling, state, effects)
     - Consider "islands architecture" with interactive client components embedded within static server-rendered content
     - Avoid unnecessarily marking parent components as client components when only child components need interactivity
     - Use proper component boundaries to minimize client JavaScript without sacrificing interactivity

### Development Workflow

- Install dependencies: `pnpm install`
- Start development: `pnpm dev`
- Build all packages: `pnpm build`
- Lint all packages: `pnpm lint`
- Format code: `pnpm format`

### When Helping With Code:

- Preserve TypeScript type safety
- Be aware of the Next.js 15 and React 19 patterns
- Leverage the monorepo structure for shared code
- Ensure code is compatible with the App Router paradigm
- Follow existing patterns for API routes (Route Handlers)
- Consider Server Components as the default, using "use client" only when necessary
- For Web SDK development, be aware of build configurations and versioning through package.json

### Common Issues to Watch For

#### Environment and Setup Issues

- Node version mismatches (should be >=20.12.0)
  - Solution: Use nvm to manage Node.js versions (see NODE_VERSION.md)
  - Always check .nvmrc before local development
- pnpm workspace dependency issues
  - Correct syntax is `"workspace:*"` for internal dependencies
  - Run `pnpm install` after adding new workspace packages
  - Check for circular dependencies in workspace packages

#### Framework and Architecture Issues

- Next.js App Router vs Pages Router confusion
  - This project exclusively uses App Router
  - Route Handlers replace API Routes from Pages Router
  - Metadata API replaces Head components
- React 19 migration patterns
  - No React.FC type annotations
  - All useRef calls must be initialized (usually with null)
  - Use React.use() for data fetching in Server Components
- Server vs. Client Component usage
  - Default to Server Components unless interactivity is needed
  - Add "use client" directive at the top of client component files
  - Import client components into server components, not vice versa
  - Don't use useState/useEffect in Server Components

#### Build and Performance Issues

- Turborepo cache invalidation
  - Run `pnpm turbo clean` to clear Turborepo cache if needed
- CSS Module naming conflicts
  - Use unique class names prefixed with component name
- API and server state management
  - Ensure proper TanStack Query configurations
  - Implement staleTime and cacheTime settings appropriately
- Environment variables
  - Client-side variables must be prefixed with NEXT*PUBLIC*

### Package and App Specifics

#### Web Application (`apps/webapp`)

- Next.js 15 application with App Router architecture
- Authentication using NextAuth.js v5 with Edge compatibility
- API Routes implemented as Route Handlers with proper fetch caching
- Uses React 19 features including new hooks system
- Extensive use of Server Components with selective Client Components
- Follows TypeScript strict mode for all components
- Uses TanStack Query v5 for data fetching and state management
- Custom UI components from the shared UI package
- Implements Partial Prerendering (PPR) for optimal static/dynamic content delivery
- Utilizes React Compiler for automatic optimization in production builds
- Configures optimizePackageImports for better bundle sizes
- Implements proper async/await patterns for params and searchParams
- Uses enhanced error boundaries with React 19 error handling
- Leverages React 19's useTransition for smoother UI updates
- Implements React 19's useFormState and useFormStatus for form handling

#### UI Library (`packages/ui`)

- Design library similar to shadcn/ui with reusable primitive components
- Built on Radix UI primitives and styled with Tailwind CSS
- Implements the "atoms" level of the atomic design pattern
- Provides foundational UI elements that can be composed into more complex components
- Storybook v8.6+ integration for component development
- Each component has:
  - TypeScript interface definitions
  - Proper React 19 patterns (no React.FC)
  - Customizable styling via Tailwind variants
  - Full testing coverage
- Components follow the accessibility and customization patterns of shadcn/ui
- Easily themeable and extensible through Tailwind configuration
- Shared across both webapp (Next.js) and web-sdk (embedded JavaScript) applications
- Ensures visual and functional consistency between different delivery formats

#### Components (`packages/components`)

- Implements the "molecules" and "organisms" levels of the atomic design pattern
- Higher-level components built by composing primitives from the UI library
- Business-logic specific components for the Genuin ecosystem
- Designed for use across applications (webapp and web-sdk packages)
- Uses React Context where appropriate for state management
- Exports type definitions for all components
- Follows React 19 patterns and Next.js 15 compatibility
- Contains functional components rather than just design elements
- Examples include:
  - Complex form components (molecules)
  - Layout systems (organisms)
  - Feature-specific UI elements (organisms)
  - Business domain components
- Shared between webapp (Next.js) and web-sdk (JavaScript SDK) implementations
- Enables consistent user experience regardless of deployment method
- Abstracts business logic to be delivery-method agnostic where possible

#### Web SDK (`packages/web-sdk`)

- Standalone embeddable React application
- Built with Rollup for optimized bundling
- Versioning through package.json
- Environment-specific builds (dev, qa, production)
- Integration with analytics (RudderStack)
- Custom loader system for external dependencies
- Multiple embed types: standard, carousel, feed
- Functionally equivalent to the webapp but delivered as an embeddable SDK
- Reuses the same UI components and business components from shared packages
- Provides identical user experience to the webapp despite different delivery method
- Adapts shared components to work in embedded contexts across different host sites

#### Configuration Packages

- **eslint-config**: Shared ESLint rules
- **tailwind-config**: Shared Tailwind theme and plugins
- **typescript-config**: Base TypeScript configurations
- **utils**: Shared utility functions and helpers

### Additional Resources

- UPGRADE_GUIDE.md contains details on Next.js 15 and React 19 upgrade
- MONOREPO_CONVERSION.md explains the repository structure conversion
- TAILWIND_V4_MIGRATION.md explains the migration status and approach
- TAILWIND_V4_MIGRATION_GUIDE.md provides detailed steps for the migration
- Package-specific README files contain detailed instructions
- NODE_VERSION.md for Node.js version requirements and setup
