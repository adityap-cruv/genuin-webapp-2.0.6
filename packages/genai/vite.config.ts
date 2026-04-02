import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig(() => {
    return {
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
        build: {
            lib: {
                entry: {
                    'genai-sdk': path.resolve(__dirname, './src/index.tsx'),     // Module version
                    'genai-loader': path.resolve(__dirname, './src/loader.js'),  // Script tag version
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
                output: {
                    format: 'es',
                    inlineDynamicImports: false,
                    chunkFileNames: chunkInfo => {
                        if (chunkInfo.name === 'react-vendor') {
                            return 'chunks/react-vendor-[hash].js';
                        }
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
                            if (moduleIds.includes('/src/App.tsx') || moduleIds.includes('/src/components/App/')) {
                                return 'chunks/app-[hash].js';
                            }

                            // Check for AgentIntro component
                            if (moduleIds.includes('/src/components/AgentIntro/')) {
                                return 'chunks/agentintro-[hash].js';
                            }

                            // Check for Chat component (excluding lazy-loaded widgets)
                            if (moduleIds.includes('/src/components/Chat/') &&
                                !moduleIds.includes('KoahAdWidget') &&
                                !moduleIds.includes('InventoryWidget')) {
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
                        // Group React-related dependencies into react-vendor chunk
                        if (id.includes('node_modules')) {
                            if (id.includes('react') || id.includes('react-dom')) {
                                return 'react-vendor';
                            }
                            // Group other dependencies into vendor chunk
                            return 'vendor-deps';
                        }
                        return undefined;
                    },
                    globals: {
                        react: 'React',
                        'react-dom': 'ReactDOM',
                    },
                },
            },
        },
        server: {
            cors: true,
        },
    };
});
