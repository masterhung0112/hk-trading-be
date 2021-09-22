import { IColumnConfig } from './IColumnConfig'

export interface IDataFrameConfig<IndexT, ValueT> {
    index?: Iterable<IndexT>
    columns?: Iterable<IColumnConfig>
    dtypes?: string[]

    values?: Iterable<ValueT>
    columnNames?: Iterable<string>
}