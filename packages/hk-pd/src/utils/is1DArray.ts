// check if a array is 1D
export function is1DArray<T>(arr: T[]) {
    if (
        typeof arr[0] == 'number' ||
        typeof arr[0] == 'string' ||
        typeof arr[0] == 'boolean'
    ) {
        return true
    } else {
        return false
    }
}