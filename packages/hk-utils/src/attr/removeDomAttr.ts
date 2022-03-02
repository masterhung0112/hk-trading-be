import { toDomElements } from '../toDomElement'

export function removeDomAttr(element: any, attrName: string) {
    const elements = toDomElements(element)
    attrName.split(' ').forEach(name =>
        elements.forEach(el =>
            el.hasAttribute(name) && el.removeAttribute(name)
        )
    )
}
