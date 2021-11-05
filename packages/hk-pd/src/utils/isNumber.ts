import t from 'typy'

export function isNumber(v: any): v is number {
    return t(v).isNumber
}