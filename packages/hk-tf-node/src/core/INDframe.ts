import { ColumnType } from './ColumnType'

export interface LocArgs {
    rows?: string[]
    columns?: string[]
}

export interface ILocArgs {
    rows?: number[]
    columns?: number[]
}

export interface INDframe {
    /**
    * Returns the data types in the DataFrame
    * @return {Array} list of data types for each column
    */
    get dtypes(): any[]

    /**
     * Gets dimension of the NDFrame
     * @returns {Integer} dimension of NDFrame
     */
    get ndim(): number

    /**
     * Gets index of the NDframe
     * @return {Array} array of index from series
     */
    get index(): ColumnType[]

    /**
     * Gets the values in the NDFrame in JS array
     * @returns {Array} Arrays of arrays of data instances
     */
    get values(): any[]

    /**
     * Gets the column names of the data
     * @returns {Array} strings of column names
     */
    get columnNames(): string[]

    /**
     * Gets a sequence of axis dimension along row and columns
     * @returns {Array} the shape of the NDFrame
     */
    get shape(): number[]

    /**
     * Purely label based indexing. Can accept string label names for both rows and columns
     * @param {kwargs} kwargs object {rows: Array of index, columns: Array of column name(s)}
     * @return INDframe data stucture
     */
    loc(kwargs?: LocArgs): INDframe

    /**
     * Access a dataframe element using row and column index
     * @param {*} kwargs object {rows: Array of index, columns: Array of column index}
     * @return INDframe data stucture
     */
    iloc(kwargs?: ILocArgs): INDframe

    /**
     * Prints the data in a Series as a grid of row and columns
     */
    toString(): string

    /**
     * Pretty prints n number of rows in a DataFrame or Series in the console
     * @param {rows} Number of rows to print
     */
    print()
}