// Returns if a value is really a number
export function isNumber(value: any) {
    return typeof value === 'number' && isFinite(value)
}