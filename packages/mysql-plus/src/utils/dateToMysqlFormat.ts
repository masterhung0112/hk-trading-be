function twoDigits(d) {
  if (0 <= d && d < 10) return '0' + d.toString()
  if (-10 < d && d < 0) return '-0' + (-1 * d).toString()
  return d.toString()
}


export function dateToMysqlFormat(d: Date) {
  if (!d) return null
  
  let dStr = d.getFullYear() + '-' + twoDigits(1 + d.getMonth()) + '-' + twoDigits(d.getDate()) + ' ' + twoDigits(d.getHours()) + ':' + twoDigits(d.getMinutes()) + ':' + twoDigits(d.getSeconds())
  const utcMilli = d.getMilliseconds()
  if (utcMilli > 0) {
    dStr += `.${utcMilli}`
  }
  return dStr
}
