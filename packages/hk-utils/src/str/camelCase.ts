const dashAlphaRe = /-([a-z])/g

export function camelCase(str: string): string {
    return str.replace(dashAlphaRe, (match: string, letter: string) => letter.toUpperCase())
}