#!/bin/bash
# Test Next.js 15 Turbopack development server performance

echo "Starting development server with Turbopack for performance evaluation..."
echo "This script allows you to compare Turbopack vs standard development server performance"

# Change to the webapp directory
cd "$(dirname "$0")/.."

# Create a temporary next.config.js for Turbopack compatibility
create_turbo_compatible_config() {
  echo "Creating Turbopack-compatible next.config.js..."
  cp next.config.js next.config.js.backup

  # Create a simple turbopack-compatible config file
  cat > next.config.turbo.js << 'EOL'
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Next.js 15 and React 19 features enabled
  experimental: {
    // typedRoutes disabled for Turbopack compatibility
    // typedRoutes: false,
    webpackBuildWorker: true,
    serverActions: {
      bodySizeLimit: '2mb',
    },
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    optimizePackageImports: [
      '@radix-ui/react-accordion',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'lucide-react',
      'react-icons/ai',
      'react-icons/bi',
      'react-icons/fi',
      'react-icons/hi',
      'react-icons/md',
      'date-fns',
      'react-hook-form',
    ],
  },

  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    resolveAlias: {},
    // Simplified rules for Turbopack compatibility
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.qa.begenuin.com' },
      { protocol: 'https', hostname: 'media.begenuin.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

// In development, just use the standard Next.js config without Sentry
module.exports = nextConfig;
EOL

  # Replace the config file with our simplified version
  mv next.config.turbo.js next.config.js

  echo "Configuration adjusted for Turbopack compatibility"
}

# Restore the original next.config.js
restore_original_config() {
  echo "Restoring original next.config.js..."
  if [ -f next.config.js.backup ]; then
    mv next.config.js.backup next.config.js
    echo "Original configuration restored"
  else
    echo "Warning: Backup file not found. Configuration was not restored."
  fi
}

# Set trap to ensure config is restored even if script is interrupted
trap restore_original_config EXIT

# Enable time tracking
START_TIME=$(date +%s)

# First, run with regular dev server for comparison
if [[ "$1" == "--compare" ]]; then
  echo "===== STANDARD WEBPACK DEV SERVER ====="
  echo "Starting standard webpack dev server for comparison..."
  echo "Press Ctrl+C after testing to proceed to Turbopack test"
  pnpm dev
fi

# Modify config for Turbopack compatibility
create_turbo_compatible_config

# Then run with Turbopack
echo "===== TURBOPACK DEV SERVER ====="
echo "Starting dev server with Turbopack enabled..."
echo "Press Ctrl+C when done testing"

# Create a temporary mocked version of the problematic component
create_component_mock() {
  echo "Creating temporary mock for problematic components..."

  # Backup the original image-cropper.tsx
  if [[ -f "src/components/common/modals/authentication/screens/image-cropper.tsx" ]]; then
    cp src/components/common/modals/authentication/screens/image-cropper.tsx src/components/common/modals/authentication/screens/image-cropper.tsx.backup

    # Create a simplified version without the problematic import
    cat > src/components/common/modals/authentication/screens/image-cropper.tsx.mock << 'EOL'
import React, { createRef, useState } from 'react'
// Removed problematic import: import 'cropperjs/dist/cropper.css'
// Mock replacement for Cropper component
const MockCropper = ({ src, style, guides }: any) => (
  <div className="mock-cropper" style={{ ...style, backgroundImage: `url(${src})` }}>
    <div>Image Cropper Mock (for Turbopack testing only)</div>
  </div>
);

import { Button } from '@components/ui/button'
import { useAuthenticationModalStore } from '../store'
import { ModalShell } from '../modal-shell'
import { v4 } from 'uuid'
import { usePathname } from 'next/navigation'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { uploadProfileImage } from '../api/auth'
import { CloseIcon } from '@icons/close-icon'

export function ImageCropper() {
  const cropperRef = createRef<any>()
  const [error, setError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const { image, setImage, goBack, close } = useAuthenticationModalStore((state) => ({
    image: state.image,
    setImage: state.setImage,
    goBack: state.goBack,
    close: state.close,
  }))
  const pathname = usePathname()
  const { channelId } = useGenuinOptions()

  if (!image) return null

  const getCropData = async () => {
    // Mock implementation
    return image;
  }

  const handleCropImage = async () => {
    setUploadingImage(true)
    setError('')

    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500))
      close()
    } catch (error) {
      setError('Failed to upload image')
    }

    setUploadingImage(false)
  }

  return (
    <ModalShell
      title="Crop Image"
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button onClick={goBack} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleCropImage} loading={uploadingImage}>
            Upload
          </Button>
        </div>
      }
    >
      <div className="relative flex flex-col gap-4">
        {error && <div className="mb-4 text-sm text-red-500">{error}</div>}
        <div className="h-[400px] w-full">
          <MockCropper
            src={image}
            style={{ height: 400, width: '100%' }}
            guides={false}
            ref={cropperRef}
          />
        </div>
      </div>
    </ModalShell>
  )
}
EOL

    # Replace the original with the mock
    mv src/components/common/modals/authentication/screens/image-cropper.tsx.mock src/components/common/modals/authentication/screens/image-cropper.tsx
    echo "Component mocked for testing"
  else
    echo "Warning: Could not find image-cropper.tsx component to mock"
  fi
}

# Restore the original component file
restore_component() {
  echo "Restoring original component files..."
  if [ -f "src/components/common/modals/authentication/screens/image-cropper.tsx.backup" ]; then
    mv src/components/common/modals/authentication/screens/image-cropper.tsx.backup src/components/common/modals/authentication/screens/image-cropper.tsx
    echo "Original component restored"
  else
    echo "Warning: Backup file not found. Component was not restored."
  fi
}

# Modify trap to include component restoration
trap 'restore_original_config; restore_component' EXIT

# Create the mock component
create_component_mock

# Kill any existing processes using port 4005
kill_existing_processes() {
  echo "Checking for processes using port 4005..."
  local pid=$(lsof -t -i:4005 -sTCP:LISTEN 2>/dev/null)
  if [ -n "$pid" ]; then
    echo "Found process $pid using port 4005, terminating..."
    kill -9 $pid
    sleep 1
  fi
}

# Kill any existing processes before starting
kill_existing_processes

# Set environment variable and run with turbo flag
NEXT_TURBO=1 PORT=4006 pnpm dev --turbo

# Calculate the time when exiting
END_TIME=$(date +%s)
echo "Development server ran for $((END_TIME-START_TIME)) seconds"
echo "Check the console output above for compilation times and HMR speed"
