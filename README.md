# Genuin-Webapp

Website for genuin.

## Running genuin-webapp

### Prerequisites

- Node.js(v18.17.0) and npm (or yarn) installed on your system. You can check by running `node -v` and `npm -v` (or `yarn -v`) in your terminal.

### Build Steps

1. **Clone the project:** If you haven't already, clone the genuin-webapp repository locally.
2. **Install dependencies:** Navigate to the project directory in your terminal and run:

   ```bash
   npm install  # or yarn install
   npm run dev
   ```

### Tools Used

- [Zustand](https://github.com/pmndrs/zustand) - State Management Library
- [React-Query](https://tanstack.com/query/latest/docs/) - Managing and caching server response.
- [Axios](https://axios-http.com/) - HTTP Client for making reqest.
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework for rapid UI development
- [Shadcn/ui](https://ui.shadcn.com/) – Re-usable components built using Radix UI and Tailwind CSS
- [Framer Motion](https://framer.com/motion) – Motion library for React to animate components with ease

## Commit Message Guidelines

Clear and informative commit messages are essential for maintaining a well-organized and collaborative codebase. These guidelines ensure consistency and clarity in your genuin-webapp project's version control history.

### Format

We recommend following the Conventional Commits specification (<https://www.conventionalcommits.org/en/v1.0.0/>). This format promotes clear and concise messages that are easily understood by developers.

A commit message typically consists of three parts:

1. **Type:** A brief description of the change (mandatory)
2. **Scope (optional):** The specific area of the project affected (e.g., `ui`, `api`, `routing`)
3. **Subject:** A concise description of the change (mandatory)

**Example:**

**Types:**

- `feat`: Introduces a new feature
- `fix`: Fixes a bug
- `docs`: Adds or updates documentation
- `style`: Changes code formatting or styling without affecting functionality
- `refactor`: Improves code structure without adding new features or fixing bugs
- `perf`: Optimizes performance
- `test`: Adds or updates tests
- `build`: Changes build process or configuration
- `ci`: Changes Continuous Integration configuration
- `chore`: Updates non-code assets (dependencies, build tools, etc.)

**Scope:**

Use the scope to indicate the specific part of the genuin-webapp project affected by the change. This helps with code navigation and understanding the impact of changes.

## Additional Tips

- Keep the subject line concise (ideally under 50 characters).
- Use imperative mood (e.g., "Implemented" instead of "Implements").
- Capitalize the first word of the subject line.
- Wrap the subject line if it exceeds the recommended length.
- If necessary, include a body section below the subject line to provide more details about the change.
- Please add <b>bugID</b> if you have fixed any bug

## Benefits of Clear Commit Messages

- Improved code history navigation and understanding.
- Easier identification of changes related to specific features or bug fixes.
- Enhanced collaboration and communication among developers.

By following these guidelines, you'll contribute to a well-documented and maintainable genuin-webapp project.
