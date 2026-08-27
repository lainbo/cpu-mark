import { defineConfig } from 'vite'
import { resolve } from 'path'
import { ArcoResolver } from 'unplugin-vue-components/resolvers'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', '@vueuse/core'],
    }),
    Components({
      resolvers: [ArcoResolver()],
    }),
    UnoCSS(),
  ],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 6789,
    open: true,
  },
  build: {
    target: 'es2021',
    rolldownOptions: {
      output: {
        minify: {
          compress: {
            dropConsole: true,
          },
        },
        codeSplitting: {
          groups: [
            {
              name: 'dep',
              test: /node_modules[\\/](vue|@vueuse|lodash-es|dayjs|@arco-design)/,
              priority: 20,
            },
            {
              name: 'table',
              test: /node_modules[\\/](vxe-table|vxe-pc-ui|xe-utils|@vxe-ui)/,
              priority: 20,
            },
          ],
        },
      },
    },
  },
})
