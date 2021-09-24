import { ISeries } from "./ISeries";

export type SeriesAggregatorFn<IndexT, ValueT, OutputT> = (values: ISeries<IndexT, ValueT>) => OutputT