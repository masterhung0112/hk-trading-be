import { Direction } from './Direction'
import { SelectorWithIndexFn } from './SelectorWithIndexFn'

export interface ISortSpec {
    sortLevel: number; // Debug helper. Sort level 0 is the first level.
    selector: SelectorWithIndexFn<any, any>;
    direction: Direction,
}