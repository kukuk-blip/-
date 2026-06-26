import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 项目页部署：用相对路径，兼容任意仓库名
  base: './',
  build: {
    sourcemap: 'hidden',
  },
  server: {
    fs: {
      // 限制 vite 只扫描项目内文件，避免扫描 tools/ 等大型本地目录导致 EMFILE
      allow: [
        // 项目根
        './',
      ],
      deny: [
        './tools/',
        './android/.gradle/',
        './android/build/',
        './android/app/build/',
        './node_modules/.cache/',
      ],
    },
  },
  optimizeDeps: {
    // 仅扫描 src 目录，避免 vite 扫描 tools/ 等大型本地目录导致 EMFILE
    entries: ['src/**/*.{js,ts,jsx,tsx}', 'index.html'],
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    traeBadgePlugin({
      variant: 'dark',
      position: 'bottom-right',
      prodOnly: true,
      clickable: true,
      clickUrl: 'https://www.trae.ai/solo?showJoin=1',
      autoTheme: true,
      autoThemeTarget: '#root'
    }),
    tsconfigPaths()
  ],
})
