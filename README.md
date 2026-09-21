## Linting

See [LINTING.md](./docs/setup/LINTING.md) for details on the monorepo linting and ESLint setup.

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

- Node.js >= 20.12.0 (required for Next.js 15 and React 19)
- [nvm](https://github.com/nvm-sh/nvm) (recommended for managing Node.js versions)

See [NODE_VERSION.md](./docs/setup/NODE_VERSION.md) for detailed instructions on setting up the correct Node.js version.

- pnpm >= 8.0.0
- Git

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start development servers:

   ```bash
   pnpm dev
   ```

3. Build all packages:
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

## Environment Variable Management: Apps & Packages

### Centralized Env Management

- Shared env variables are defined in the root `.env` file.
- App- and package-specific overrides can be placed in their respective `.env` files (e.g., `apps/webapp/.env`).
- Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

### Injecting Env Vars in Apps with `env-cmd`

- Apps use [`env-cmd`](https://www.npmjs.com/package/env-cmd) to inject environment variables from the root `.env` into their runtime.
- Example (`apps/webapp/package.json`):
  ```json
  "scripts": {
    "dev": "env-cmd -f ../../.env next dev -p 4005"
  }
  ```
- This ensures all apps receive the same env context, avoiding duplication and drift.

### Injecting Env Vars in Packages (Vite/Storybook)

- Shared packages (like `@genuin/components`, `@genuin/ui`) use Vite and Storybook for development and documentation.
- These packages inject env variables for Storybook via the `define` property in the `viteFinal` config in `.storybook/main.ts`:
  ```ts
  viteFinal: (config) => {
    return {
      ...config,
      define: {
        ...config.define,
        "import.meta.env.NEXT_PUBLIC_RUDDERSTACK_KEY": JSON.stringify(process.env.NEXT_PUBLIC_RUDDERSTACK_KEY),
        "import.meta.env.NEXT_PUBLIC_RUDDERSTACK_URL": JSON.stringify(process.env.NEXT_PUBLIC_RUDDERSTACK_URL),
        "import.meta.env.NEXT_PUBLIC_MEDIA_BASE_URL": JSON.stringify(process.env.NEXT_PUBLIC_MEDIA_BASE_URL),
        "import.meta.env.NEXT_PUBLIC_HOST_URL": JSON.stringify(process.env.NEXT_PUBLIC_HOST_URL),
      },
    };
  };
  ```
- This allows Storybook stories and Vite builds in packages to access the same env variables as the main app, ensuring consistency across the monorepo.

### Best Practices

- Add new shared envs to the root `.env` and document them in `.env.example`.
- Use `env-cmd` in all scripts that start apps to ensure env consistency.
- For Storybook, update the `define` block in `.storybook/main.ts` to expose any new public envs needed for stories.
- Never commit secrets; use `.env.local` for local overrides.

### Example: Adding a New Public Env Variable

1. Add to root `.env` and `.env.example`:
   ```
   NEXT_PUBLIC_NEW_FEATURE_FLAG=true
   ```
2. Reference in your code as `process.env.NEXT_PUBLIC_NEW_FEATURE_FLAG` (Node) or `import.meta.env.NEXT_PUBLIC_NEW_FEATURE_FLAG` (Vite/Storybook).
3. If needed in Storybook, add to the `define` block in `.storybook/main.ts`.

---

This approach ensures all apps and packages in the monorepo have a consistent, secure, and maintainable environment variable setup, both in development and in Storybook.

## Dependency Management

This monorepo employs a centralized dependency management strategy using pnpm workspaces to optimize performance, ensure consistency, and simplify maintenance.

**Key Principles:**

- **Root-Level Dependencies:** Common dependencies, especially those shared across multiple packages (e.g., React, Next.js, Radix UI components, Tailwind CSS, major UI libraries), are declared in the root `package.json`. This promotes version consistency and allows pnpm to hoist them efficiently.
- **Peer Dependencies:** Workspace packages (e.g., `@genuin/ui`, `@genuin/components`) declare shared libraries they rely on (like React, Radix UI components) as `peerDependencies`. This makes the dependency relationship explicit and ensures that the consuming application or package provides a compatible version (usually hoisted from the root).
- **Workspace Packages:** Internal packages (`@genuin/*`) are referenced using `workspace:*` protocol in `package.json` files, ensuring pnpm links them locally.
- **Hoisting Configuration:** The `.npmrc` file is configured with `shamefully-hoist=false` to encourage explicit dependency declarations. Specific, widely-used dependencies are hoisted to the root `node_modules` via `public-hoist-pattern[]` for easy access by all packages and to ensure single instances (e.g., React, Radix UI).
- **Package-Specific Dependencies:** Dependencies that are unique to a single application or package are declared directly in its own `package.json`.

**Managing Dependencies:**

The root `package.json` includes several scripts to help manage and validate dependencies across the monorepo:

- `pnpm deps:check`: Lists any version mismatches for shared dependencies between packages (using `syncpack`).
- `pnpm deps:fix`: Attempts to automatically fix version mismatches found by `syncpack`.
- `pnpm deps:update`: Interactively updates dependencies to their latest versions (using `npm-check-updates`) and then runs `pnpm install`.
- `pnpm deps:unused`: Checks for unused dependencies within each package (using `depcheck`). A root `.depcheckrc.json` file is configured to ignore intentionally hoisted or monorepo-tooling-related false positives.
- `pnpm deps:validate`: A convenience script that runs both `deps:check` and `deps:unused`.

When adding a new shared dependency, prefer adding it to the root `package.json`. If a package requires a specific version of a shared library that conflicts with the root, carefully consider the implications. For new package-specific dependencies, add them directly to the package's `package.json`. Always run `pnpm install` from the root after making changes to dependencies.

For more detailed information on the dependency management strategy and its implementation, see the [Dependency Optimization Instructions](./docs/setup/DEPENDENCY_MANAGEMENT.md).

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
   - Branch from the active release train, not `main` — e.g.
     `origin/release/genuin-sdk/2.0.6`
   - Name the branch `<type>/GEN-<ticket>/<slug>` (see
     [Commits & branches](#commits--branches))
   - Follow conventional commits — this is enforced by a git hook
   - Run tests before pushing

3. **Building for Production**
   ```bash
   pnpm build
   ```

## Commits & branches

Every change is traceable to a Jira ticket in the `GEN` project. Git hooks enforce
this locally — you will be blocked, not warned.

### Branch names

```
<type>/GEN-<ticket>/<slug>

feature/GEN-10459/cxr-c8-ad-group-id
bugfix/GEN-10461/webp-fallback
chore/GEN-10463/bump-turbo
```

| Type      | Use for                       |
| --------- | ----------------------------- |
| `feature` | New behaviour                 |
| `bugfix`  | Fixing something broken       |
| `hotfix`  | Urgent production fix         |
| `chore`   | Tooling, dependencies, config |
| `docs`    | Documentation only            |

`release/*`, `support/*` and `stable/*` are named for a version and carry no ticket.
`backport/*` branches made by the backport tooling are exempt too, since their commits
already carry the original ticket.
`feat/`, `fix/`, `cxr/` and `security/` are **not** valid — use the full names above.

### Commit messages

State the ticket **once**, in the branch name. A hook writes it into every commit:

```
$ git checkout -b feature/GEN-10459/cxr-c8-ad-group-id
$ git commit -m "feat(cxr): accommodate Infolinks c8"

  ...is recorded as:
  [GEN-10459] feat(cxr): accommodate Infolinks c8
```

Do not type `[GEN-10459]` yourself — you will end up with it twice.

The part you write follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

- **type** — `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`
- **scope** — optional, lower-case, e.g. `cxr` `feed` `embed` `ui` `deps`
- **subject** — imperative, no trailing period, whole line under 100 characters

### Pull request titles

Write the title as `[GEN-<n>] <type>(<scope>): <summary>`. It matters when your PR has more than one
commit, because the squash-merge commit then takes the PR title. GitHub's default title for such a PR
comes from the branch name with hyphens turned into spaces, which breaks the ticket
(`GEN-10459` → `GEN 10459`). A single-commit PR keeps its commit's subject, so it is already right.

### Existing branches

Branches that existed before this landed are **grandfathered** — they are listed in
`scripts/jira-hook/grandfathered.txt` and need no ticket. Message rules still apply
to them, since those need no rename. Branches created from now on need a ticket.

### If you get blocked

The hook prints the exact fix. Almost always it is a rename, which is free and does
not touch your staged changes:

```
git branch -m feature/GEN-10459/my-slug
```

Two cases where a rename is not that simple:

- **The branch is checked out in another worktree.** `git branch -m` refuses. Switch
  that worktree off the branch first, or remove it.
- **The branch is already pushed, with an open PR.** Renaming locally orphans the
  remote branch. Push the new name, repoint the PR, then delete the old remote
  branch — do not just rename and force things.

If you have no ticket, make one. That is the point of this — not the branch name.

**Do not use `--no-verify`.** It skips lint-staged, type checks and the production
builds along with this check, so it costs far more safety than it saves.

## Contributing

1. Create a branch named `<type>/GEN-<ticket>/<slug>` off the active release train
2. Make your changes
3. Run tests and linting
4. Submit a pull request, filling in the Jira field in the template

## License

ISC
