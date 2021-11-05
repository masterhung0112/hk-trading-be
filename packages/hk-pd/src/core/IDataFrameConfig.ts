import { IColumnConfig } from './IColumnConfig'
import { IColumnSpec } from './IColumnSpec'

export interface IDataFrameConfig<IndexT, ValueT> {
    values?: Iterable<ValueT>
    
    rows?: Iterable<any[]>

    index?: Iterable<IndexT>

    pairs?: Iterable<[IndexT, ValueT]>
    
    columnNames?: Iterable<string>

    baked?: boolean,
    considerAllRows?: boolean
    columns?: Iterable<IColumnConfig> | IColumnSpec

    caseSensitive?: boolean
}