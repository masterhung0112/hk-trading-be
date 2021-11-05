// Returns if a value is really a string
export function isString(value: any): value is string {
    return typeof value === 'string' || value instanceof String
}