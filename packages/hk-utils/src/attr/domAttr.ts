import { isNumber } from '..'
import { isFunction } from '../primitives/isFunction'
import { isObject } from '../primitives/isObject'
import { removeDomAttr } from './removeDomAttr'
import { toDomElement, toDomElements } from '../toDomElement'

export function domAttr(targetElement: any, targetName: string | object, value?: Function | string | number| undefined | null) {
    if (isObject(targetName)) {
        Object.keys(targetName).forEach((key) => {
            domAttr(targetElement, key, (targetName as any)[key])
        })
        return
    }

    if (value === undefined) {
        targetElement = toDomElement(targetElement)
        return targetElement && targetElement.getAttribute(targetName)
    } else {
        toDomElements(targetElement).forEach(element => {
            if (isFunction(value)) {
                value = value.call(element, domAttr(element, targetName))
            }

            if (value === null) {
                removeDomAttr(element, targetName)
            } else if (typeof value === 'string') {
                element.setAttribute(targetName, value)
            } else if (isNumber(value)) {
                element.setAttribute(targetName, `${value}`)
            } else {
                console.error(`unknown type for value ${value} of attr ${targetName}`)
            }
        })
    }

}
