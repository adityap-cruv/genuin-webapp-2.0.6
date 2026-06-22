import path from 'path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig(() => {
    const shared = {
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        define: {
            'process.env': {},
        },
        css: {
            postcss: './postcss.config.cjs',
        },
    };

    // App-mode build: emits index.html + mounts src/main.tsx, so `vite preview`
    // can serve a runnable demo. Output kept separate from the shipped lib build.
    // Keyed off BUILD_TARGET (not vite mode) so the build can still run under
    // `--mode development` and pick up VITE_* keys from .env.development.
    if (process.env.BUILD_TARGET === 'preview') {
        return {
            ...shared,
            build: {
                outDir: 'dist',
            },
        };
    }

    return {
        ...shared,
        build: {
            lib: {
                entry: {
                    'genai-sdk': path.resolve(__dirname, './src/index.ts'), // Module version
                    'genai-loader': path.resolve(__dirname, './src/loader.js'), // Script tag version
                },
                name: 'GenAISDK',
                fileName: (format, entryName) => {
                    if (entryName === 'genai-loader') {
                        return 'genai-loader.js';
                    }
                    return `genai-sdk.${format}.js`;
                },
                formats: ['es'],
            },
            rollupOptions: {
                external: ['react', 'react-dom', 'react/jsx-runtime'],
                output: {
                    format: 'es',
                    inlineDynamicImports: false,
                    chunkFileNames: chunkInfo => {
                        if (chunkInfo.name === 'vendor-deps') {
                            return 'chunks/vendor-deps-[hash].js';
                        }

                        // Named chunks for lazy-loaded widgets
                        if (chunkInfo.name === 'koah-widget') {
                            return 'chunks/koah-widget-[hash].js';
                        }
                        if (chunkInfo.name === 'inventory-widget') {
                            return 'chunks/inventory-widget-[hash].js';
                        }

                        // Hardcoded conditions for specific component chunks
                        if (chunkInfo.moduleIds) {
                            const moduleIds = chunkInfo.moduleIds.join(' ');

                            // Check for KoahAdWidget (lazy loaded)
                            if (moduleIds.includes('KoahAdWidget')) {
                                return 'chunks/koah-widget-[hash].js';
                            }

                            // Check for InventoryWidget (lazy loaded)
                            if (moduleIds.includes('InventoryWidget')) {
                                return 'chunks/inventory-widget-[hash].js';
                            }

                            // Check for App component
                            if (moduleIds.includes('/src/renderer/App.tsx') || moduleIds.includes('/src/renderer/')) {
                                return 'chunks/app-[hash].js';
                            }

                            // Check for AgentIntro component
                            if (moduleIds.includes('/src/components/AgentIntro/')) {
                                return 'chunks/agentintro-[hash].js';
                            }

                            // Check for Chat component (excluding lazy-loaded widgets)
                            if (
                                moduleIds.includes('/src/components/Chat/') &&
                                !moduleIds.includes('KoahAdWidget') &&
                                !moduleIds.includes('InventoryWidget')
                            ) {
                                return 'chunks/chat-[hash].js';
                            }
                        }

                        // Fallback: convert chunk name to lowercase with hyphens
                        const name = chunkInfo.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                        return `chunks/${name}-[hash].js`;
                    },
                    assetFileNames: assetInfo => {
                        const fileName = assetInfo.names[0]?.split('.') || 'unknown';
                        const ext = fileName[fileName.length - 1];
                        if (ext === 'css') {
                            return `[name][extname]`;
                        }
                        return `assets/[name]-[hash][extname]`;
                    },
                    manualChunks: (id: string) => {
                        // Group React-related dependencies into react-vendor chunk.
                        // Match only the core React packages — `react-remove-scroll`,
                        // `use-sidecar`, etc. depend on tslib helpers and break when split
                        // away from their helpers.
                        if (id.includes('node_modules')) {
                            if (
                                /[\\/]node_modules[\\/](react|react-dom|scheduler|use-sync-external-store)[\\/]/.test(
                                    id
                                )
                            ) {
                                return 'react-vendor';
                            }
                            // Group other dependencies into vendor chunk
                            return 'vendor-deps';
                        }
                        return undefined;
                    },
                },
            },
        },
        server: {
            cors: true,
        },
    };
});
