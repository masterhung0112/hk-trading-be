import { isDomNode } from './isDomNode'
import { isWindow } from './isWindow'

export function domNodeType(v: any): Node['nodeType'] {
    return !isWindow(v) && isDomNode(v) && v.nodeType || 0
}