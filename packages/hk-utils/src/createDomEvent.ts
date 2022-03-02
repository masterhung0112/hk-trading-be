import { isString } from './primitives/isString'

export function createDomEvent(e: string | Event, bubbles = true, cancelable = false, detail: string) {
    if (isString(e)) {
        const customEvent = new CustomEvent(e, {
            bubbles,
            cancelable,
            detail
        })
        e = customEvent
    }

    return e
}