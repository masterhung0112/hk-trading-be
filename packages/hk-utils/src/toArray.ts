export const toArray = Array.from || (<T>(value: T): T[] => Array.prototype.slice.call(value))
