import { createApp } from 'vue'
import App from './App.vue'
import 'virtual:windi.css'
import '@/styles/global.scss'
import '@arco-design/web-vue/es/message/style/css.js'
import 'xe-utils'
import { Header, Column, Tooltip, Table } from 'vxe-table'

function useTable(app) {
  app.use(Header).use(Column).use(Tooltip).use(Table)
}

createApp(App).use(useTable).mount('#app')
