# Node.js Version Requirements

This project requires Node.js version 20.12.0 or higher as specified in the `.nvmrc` file.

## Why Node.js 20?

Next.js 15 and the modern dependencies used in this project work best with Node.js 20, which includes:

- Improved performance and security
- Full ES modules support
- Better support for modern JavaScript features
- Long-term support (LTS) until April 2026

## Setting Up Your Environment

### Option 1: Using nvm (recommended)

[nvm](https://github.com/nvm-sh/nvm) allows you to easily switch between Node.js versions.

1. Install nvm by following instructions at: https://github.com/nvm-sh/nvm#installing-and-updating

2. Install and use the correct Node.js version:

   ```bash
   # Navigate to the project directory (containing .nvmrc)
   cd genuin-webapp-standalone

   # Install the specified Node.js version
   nvm install

   # Use the specified version for this project
   nvm use
   ```

3. Make this your default Node.js version (optional):

   ```bash
   nvm alias default $(cat .nvmrc)
   ```

4. Verify the installation:
   ```bash
   node --version  # Should output v20.12.0 or higher
   ```

### Option 2: Direct Installation

Download and install Node.js 20.x from the [official website](https://nodejs.org/).

## Automatic Version Checking

The project includes automatic Node.js version checks that run before installation, development, and build processes:

- In **production**: The build will fail if the Node.js version doesn't match the requirements
- In **development**: A warning is shown but the process continues (some features may not work correctly)

### Environment Variables

You can control the Node.js version checking behavior with these environment variables:

- `FORCE_NODE_VERSION_CHECK=true` - Always fail if the version doesn't match, even in development
- `ALLOW_NODE_VERSION_WARNING=false` - Fail on version mismatch even in development (default is to allow with warning)

## Troubleshooting

If you're seeing Node.js version errors:

1. Check your current Node.js version: `node --version`
2. Use nvm to install and switch to the required version: `nvm install && nvm use`
3. If using CI/CD pipelines, ensure they use Node.js 20.x
4. For Docker deployments, make sure the Dockerfile uses a Node.js 20.x base image
