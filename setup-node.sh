#!/usr/bin/env bash
# This script helps install and use the correct Node.js version for this project

set -e

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if nvm is installed
if ! command_exists nvm; then
  echo "nvm is not installed or not in your PATH."
  echo ""
  echo "Install nvm using one of these methods:"
  echo "1. curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash"
  echo "2. wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash"
  echo ""
  echo "After installing, restart your terminal and run this script again."
  exit 1
fi

# Read Node.js version from .nvmrc
NODE_VERSION=$(cat .nvmrc)

echo "Installing Node.js $NODE_VERSION..."
nvm install "$NODE_VERSION"

echo "Setting Node.js $NODE_VERSION as the current version..."
nvm use "$NODE_VERSION"

# Optional: Set as default
read -p "Do you want to set Node.js $NODE_VERSION as your default? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  nvm alias default "$NODE_VERSION"
  echo "Node.js $NODE_VERSION is now your default version."
fi

# Install pnpm if needed
if ! command_exists pnpm; then
  echo "Installing pnpm..."
  npm install -g pnpm
fi

echo ""
echo "✅ Environment setup complete!"
echo "Current Node.js version: $(node -v)"
echo "Current npm version: $(npm -v)"
echo "Current pnpm version: $(pnpm -v)"
echo ""
echo "You can now run 'pnpm install' to install dependencies."
