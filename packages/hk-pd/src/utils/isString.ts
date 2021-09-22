// Returns if a value is really a string
export function isString(value: any) {
    return typeof value === 'string' || value instanceof String
}