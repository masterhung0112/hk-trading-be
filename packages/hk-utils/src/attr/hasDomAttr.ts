import { toDomElements } from '../toDomElement'

export function hasDomAttr(element: any, name: string) {
    return toDomElements(element).some(el => el.hasAttribute(name))
}
