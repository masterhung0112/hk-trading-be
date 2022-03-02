import { isDomNode } from './isDomNode'
import { toArray } from './toArray'

export function toDomNodes(v: any): Node[] {
    return v && (isDomNode(v) ? [v] : toArray<Node>(v).filter(isDomNode)) || []
}

export function toDomNode(v: any): Node {
    return toDomNodes(v)[0]
}
