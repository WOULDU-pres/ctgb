import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - separate large libraries
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-radix': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
          ],
          'vendor-ui': [
            'lucide-react',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
            'next-themes',
          ],
          'vendor-form': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
          ],
          'vendor-utils': [
            'date-fns',
            'html-to-image',
            'sonner',
          ],
          // Game-specific chunks - split by usage pattern
          'game-core': [
            './src/hooks/useGameLogic',
            './src/hooks/useGameState',
          ],
          'game-screens': [
            './src/components/game/MenuScreen',
            './src/components/game/ResultScreen',
          ],
          'game-states': [
            './src/components/game/states/WaitingScreen',
            './src/components/game/states/ReadyScreen',
            './src/components/game/states/TooSoonScreen',
            './src/components/game/states/ResultDisplay',
          ],
          // Settings and profile chunks (less frequently used)
          'settings': [
            './src/components/SettingsToggle',
            './src/components/ProfileAvatar',
            './src/components/ThemeProvider',
          ],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 800,
    // Enable source maps for better debugging in production
    sourcemap: mode === 'development',
    // Optimize CSS
    cssCodeSplit: true,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
  },
  // Tree shaking optimization
  define: {
    __DEV__: mode === 'development',
  },
}));
