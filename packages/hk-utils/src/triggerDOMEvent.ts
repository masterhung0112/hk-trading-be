import { createDomEvent } from './createDomEvent'
import { toDomEventTargets } from './toDomEventTargets'

export function triggerDomEvent(targets, event: string | Event, detail: string) {
    return toDomEventTargets(targets).reduce((notCanceled, target) =>
            notCanceled && target.dispatchEvent(createDomEvent(event, true, true, detail))
        , true)
}