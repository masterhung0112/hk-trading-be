import { isDomElement } from '../isDomElement'
import { toDomNode, toDomNodes } from '../toDomNode'

export function noop() {}

const elProto = typeof window !== 'undefined' ? Element.prototype : {
    matches: (selectors: string) => boolean,
    webkitMatchesSelector: (selectors: string) => boolean,
    msMatchesSelector: (selectors: string) => boolean
}
const matchesFn = elProto.matches || elProto.webkitMatchesSelector || elProto.msMatchesSelector || noop


export function matches(element: Element, selector: string) {
    return toDomNodes(element).some(el => matchesFn.call(el, selector))
}

export function parent(element: Element) {
    element = toDomNode(element)
    return element && isDomElement(element.parentNode) && element.parentNode
}

export function filter(element: Element, selector: string) {
    return toDomNodes(element).filter(element => matches(element, selector))
}

export function children(element: Element, selector: string) {
    element = toDomNode(element)
    const children = element ? toDomNodes(element.children) : []
    return selector ? filter(children, selector) : children
}

export function index(element: Element, ref?: any) {
    return ref
        ? toDomNodes(element).indexOf(toDomNode(ref))
        : children(parent(element)).indexOf(element)
}
