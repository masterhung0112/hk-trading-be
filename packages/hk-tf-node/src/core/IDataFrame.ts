import { ILocArgs, INDframe, LocArgs } from './INDframe'

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

    loc(kwargs?: LocArgs): IDataFrame
    iloc(kwargs?: ILocArgs): IDataFrame
}