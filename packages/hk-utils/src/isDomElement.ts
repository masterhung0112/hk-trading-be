import { domNodeType } from './domNodeType'

export function isDomElement(v: any): v is Element {
    return domNodeType(v) === 1
}