import { IDataFrameConfig } from './IDataFrameConfig'

export type DataFrameConfigFn<IndexT, ValueT> = () => IDataFrameConfig<IndexT, ValueT>;
