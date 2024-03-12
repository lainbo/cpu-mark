import { defineConfig } from 'vite'
import { resolve } from 'path'
import { ArcoResolver } from 'unplugin-vue-components/resolvers'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import UnoCSS from 'unocss/vite'
import { createStyleImportPlugin, VxeTableResolve } from 'vite-plugin-style-import'

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    AutoImport({
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true,
      },
      imports: ['vue', '@vueuse/core'],
    }),
    Components({
      resolvers: [ArcoResolver()],
    }),
    UnoCSS(),
    createStyleImportPlugin({
      resolves: [VxeTableResolve()],
    }),
    // chunkSplitPlugin({
    //   strategy: 'default',
    //   customSplitting: {
    //     utils: [/src\/utils/],
    //     assets: [/src\/assets/],
    //     table: ['vxe-table'],
    //     arco: ['@arco-design/web-vue']
    //   }
    // })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 6789,
    open: true,
  },
  build: {
    target: 'es2021',
    minify: 'terser',
    terserOptions: {
      ecma: 2020,
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          dep: ['vue', '@vueuse/core', 'lodash-es', 'dayjs', '@arco-design/web-vue'],
          table: ['vxe-table', 'xe-utils'],
        },
      },
    },
  },
})
