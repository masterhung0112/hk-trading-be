import t from 'typy'

export function isArray(v: any): v is Function {
    return t(v).isArray
}