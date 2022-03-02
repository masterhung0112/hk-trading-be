export function callCallback(fn: Function, thisArg: any, ...argArray: any[]) {
    if (fn && typeof fn.call === 'function') {
        return fn.apply(thisArg, argArray)
    }
}