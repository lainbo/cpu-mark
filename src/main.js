import { createApp } from 'vue'
import App from './App.vue'
import 'uno.css'
import '@unocss/reset/tailwind.css'
import '@/styles/index.scss'
import '@arco-design/web-vue/es/message/style/css.js'
import 'xe-utils'
import { Header, Icon, Column, Tooltip, Table } from 'vxe-table'

function useTable(app) {
  app.use(Header).use(Icon).use(Column).use(Tooltip).use(Table)
}

createApp(App).use(useTable).mount('#app')
