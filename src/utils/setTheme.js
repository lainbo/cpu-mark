import { VxeUI } from 'vxe-pc-ui/es/ui'

const bodyDom = document.body // body的dom
const isDark = useDark() // 响应式：是否为暗色

/**
 * 设置主题
 * @param {Boolean} val true: 深色，false: 浅色
 */
export function setTheme(val) {
  document.documentElement.classList.toggle('dark', val)
  VxeUI.setTheme(val ? 'dark' : 'light')
  if (val) bodyDom.setAttribute('arco-theme', 'dark')
  else bodyDom.removeAttribute('arco-theme')
}

// 监听是否暗色
watchEffect(() => {
  setTheme(isDark.value)
})
