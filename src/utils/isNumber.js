// 返回是否是数字
export function isNumber(val) {
  return !isNaN(parseFloat(val)) && isFinite(val)
}
