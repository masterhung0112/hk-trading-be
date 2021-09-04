// Returns if a value is an object
export function isObject(value) {
    return value && typeof value === 'object' && value.constructor && !('length' in value) //&& value.constructor.name === 'Object'
}