import { ISeries } from './ISeries'
import { IDataFrame } from './IDataFrame'

export type SeriesSelectorFn<IndexT, DataFrameValueT, SeriesValueT> = (dataFrame: IDataFrame<IndexT, DataFrameValueT>) => ISeries<IndexT, SeriesValueT>
