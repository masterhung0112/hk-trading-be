export function isDate(v: any): v is Date {
    return Object.prototype.toString.call(v) === '[object Date]'
}