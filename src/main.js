import { createApp } from 'vue'
import App from './App.vue'
import 'uno.css'
import '@unocss/reset/tailwind.css'
import '@/styles/index.scss'
import '@arco-design/web-vue/es/message/style/css.js'
import { VxeTooltip, VxeIcon } from 'vxe-pc-ui'
import { VxeTable, VxeColumn } from 'vxe-table'
import 'vxe-pc-ui/es/icon/style.css'
import 'vxe-pc-ui/es/tooltip/style.css'
import 'vxe-table/es/style.css'

function useTable(app) {
  app.use(VxeIcon).use(VxeTooltip).use(VxeTable).use(VxeColumn)
}

createApp(App).use(useTable).mount('#app')
