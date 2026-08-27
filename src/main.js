import { createApp } from 'vue'
import App from './App.vue'
import 'uno.css'
import '@unocss/reset/tailwind.css'
import '@/styles/index.scss'
import '@arco-design/web-vue/es/message/style/css.js'
import { VxeUI } from 'vxe-pc-ui/es/ui'
import zhCN from 'vxe-pc-ui/es/language/zh-CN'
import { VxeTooltip } from 'vxe-pc-ui/es/tooltip'
import { VxeIcon } from 'vxe-pc-ui/es/icon'
import { VxeLoading } from 'vxe-pc-ui/es/loading'
import { VxeTable } from 'vxe-table/es/table'
import { VxeColumn } from 'vxe-table/es/column'
import 'vxe-pc-ui/es/icon/style.css'
import 'vxe-pc-ui/es/tooltip/style.css'
import 'vxe-pc-ui/es/loading/style.css'
import 'vxe-table/es/style.css'

VxeUI.setI18n('zh-CN', zhCN)
VxeUI.setLanguage('zh-CN')
VxeUI.setTheme('light')

function useTable(app) {
  app.use(VxeIcon).use(VxeTooltip).use(VxeLoading).use(VxeTable).use(VxeColumn)
}

createApp(App).use(useTable).mount('#app')
