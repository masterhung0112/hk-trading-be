import t from 'typy'

export function isFunction(v: any): v is Function {
    return t(v).isFunction
}