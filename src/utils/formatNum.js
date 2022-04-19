/**
 * 格式化数字(3位加逗号)
 *  @param { number } num
 */
export const formatNum = num => {
  if (typeof num !== 'number') return '-'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
