import { createApp } from 'vue'
import App from './App.vue'
import 'virtual:windi.css'
import '@/styles/global.scss'
import '@/styles/vxe.scss'
import '@arco-design/web-vue/es/message/style/css.js'
import 'xe-utils'
import VXETable from 'vxe-table'
createApp(App).use(VXETable).mount('#app')
