// check if key is in object
export function keyInObject(object: Record<string, any>, key: string): boolean {
    return !!Object.prototype.hasOwnProperty.call(object, key)
}