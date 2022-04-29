import { defineConfig } from 'windicss/helpers'

export default defineConfig({
  preflight: {
    blocklist: 'img'
  },
  theme: {
    screens: {
      sm: '768px',
      md: '992px',
      lg: '1070px',
      xl: '1920px',
      '2xl': '2160px'
    }
  }
})
