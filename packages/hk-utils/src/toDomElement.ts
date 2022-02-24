import { isDomElement } from './isDomElement'
import { toArray } from './toArray'

export function toDomElements(v: any): Element[] {
    return v && (isDomElement(v) ? [v] : toArray<Element>(v).filter(isDomElement)) || []
}

export function toDomElement(v: any): Element | undefined {
    const elements = toDomElements(v)
    return elements && elements.length > 0 ? elements[0] : undefined
}
