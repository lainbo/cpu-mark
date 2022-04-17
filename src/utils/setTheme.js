const isDark = useDark() // 响应式：是否为暗色
const htmlDom = document.documentElement // html的dom
// 切换为深色
const setThemeDark = () => {
  htmlDom.classList.remove('light')
  htmlDom.classList.add('dark')
  document.body.setAttribute('arco-theme', 'dark')
}

// 切换为浅色
const setThemeLight = () => {
  htmlDom.classList.remove('dark')
  htmlDom.classList.add('light')
  document.body.removeAttribute('arco-theme')
}
// 监听是否暗色
watch(isDark, () => setTheme())

// 主题初始化
const setTheme = () => {
  isDark.value ? setThemeDark() : setThemeLight()
}
