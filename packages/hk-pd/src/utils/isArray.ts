import t from 'typy'

export function isArray(v: any): v is Array<any> {
    return t(v).isArray
}