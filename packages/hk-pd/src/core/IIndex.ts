import { ISeries } from "./ISeries";

export type IIndexPredicateFn = (value: any, against: any) => boolean

export interface IIndex<IndexT> extends ISeries<number, IndexT> {
    getType(): string
    getLessThan(): IIndexPredicateFn
    getLessThanOrEqualTo(): IIndexPredicateFn
    getGreaterThan(): IIndexPredicateFn
}