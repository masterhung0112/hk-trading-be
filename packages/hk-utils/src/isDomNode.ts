import { domNodeType } from './domNodeType'

export function isDomNode(v: any): v is Node {
    return domNodeType(v) >= 1
}