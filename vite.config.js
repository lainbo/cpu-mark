import { defineConfig } from 'vite'
import { resolve } from 'path'
import { ArcoResolver } from 'unplugin-vue-components/resolvers'
import { chunkSplitPlugin } from 'vite-plugin-chunk-split'
import WindiCSS from 'vite-plugin-windicss'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    WindiCSS(),
    AutoImport({
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true
      },
      imports: ['vue', '@vueuse/core']
    }),
    Components({
      resolvers: [ArcoResolver()]
    }),
    chunkSplitPlugin({
      strategy: 'default',
      customSplitting: {
        utils: [/src\/utils/],
        assets: [/src\/assets/],
        table: ['vxe-table'],
        'component-library': ['@arco-design/web-vue']
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
