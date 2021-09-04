function twoDigits(d) {
  if (0 <= d && d < 10) return '0' + d.toString()
  if (-10 < d && d < 0) return '-0' + (-1 * d).toString()
  return d.toString()
}


export function dateToMysqlFormat(d: Date) {
  if (!d) return ''
  
  let dStr = d.getUTCFullYear() + '-' + twoDigits(1 + d.getUTCMonth()) + '-' + twoDigits(d.getUTCDate()) + ' ' + twoDigits(d.getUTCHours()) + ':' + twoDigits(d.getUTCMinutes()) + ':' + twoDigits(d.getUTCSeconds())
  const utcMilli = d.getUTCMilliseconds()
  if (utcMilli > 0) {
    dStr += `.${utcMilli}`
  }
  return dStr
}
