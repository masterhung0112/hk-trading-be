import { isArray } from './primitives/isArray'
import { isString } from './isString'
import { toDomNode, toDomNodes } from './toDomNode'

function isEventTarget(target: any): target is EventTarget {
    return target && 'addEventListener' in target
}

function toEventTarget(target: any): EventTarget {
    return isEventTarget(target) ? target : toDomNode(target)
}

export function toDomEventTargets(target: string | Element | Element[]) {
    return isArray(target)
        ? target.map(toEventTarget).filter(Boolean)
        : isString(target)
            ? findAll(target)
            : isEventTarget(target)
                ? [target]
                : toDomNodes(target)
}
