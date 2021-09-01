import { ColumnType } from './ColumnType'
import { ILocArgs, INDframe, LocArgs } from './INDframe'

export interface DropArgs {
    columns?: ColumnType[]
    index?: ColumnType[]
    axis?: number
    inplace?: boolean
}

/**
 * A 2D frame object that stores data in structured tabular format
 * @param {data} data, JSON, Array, 2D Tensor
 * @param {kwargs} Object {columns: Array of column names, defaults to ordered numbers when not specified
 *                        dtypes: strings of data types, automatically inferred when not specified
 *                        index: row index for subseting array, defaults to ordered numbers when not specified}
 *
 * @returns DataFrame
 */
export interface IDataFrame extends INDframe {
    /**
     * Prints the first n values in a dataframe
     * @param {rows}  rows --> int
     * @returns DataFrame
     */
    head(rows?: number): IDataFrame

    /**
     * Drop a list of rows or columns base on the specified axis
     * @param {Object} kwargs Configuration object
     *             {columns: [Array(Columns| Index)] array of column names to drop
     *              axis: row=0, columns=1
     *             inplace: specify whether to drop the row/column with/without creating a new DataFrame}
     * @returns null | DataFrame
     *
     */
    drop(kwargs: DropArgs)

    /**
     * Purely label based indexing. Can accept string label names for both rows and columns
     * @param {kwargs} kwargs object {rows: Array of index, columns: Array of column name(s)}
     * @return INDframe data stucture
     */
    loc(kwargs?: LocArgs): IDataFrame
    iloc(kwargs?: ILocArgs): IDataFrame

    get ctypes(): INDframe
}