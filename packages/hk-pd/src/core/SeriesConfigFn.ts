import { ISeriesConfig } from './ISeriesConfig'

export type SeriesConfigFn<IndexT, ValueT> = () => ISeriesConfig<IndexT, ValueT>
