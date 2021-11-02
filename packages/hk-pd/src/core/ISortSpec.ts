import { Direction } from './Direction'
import { SortSelectorFn } from './SortSelectorFn'

export interface ISortSpec {
    sortLevel: number; // Debug helper. Sort level 0 is the first level.
    selector: SortSelectorFn;
    direction: Direction,
}