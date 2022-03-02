import { IDataFrame } from '../core/IDataFrame'

export interface ICsvOption<T = any> {
    /**
     * Optionally specifies the column names (when enabled, assumes that the header row is not read from the CSV data).
     * Default: undefined
     */
    columnNames?: Iterable<string>
    /**
     * Automatically pick types based on what the value looks like.
     * Default: false.
     */
    dynamicTyping?: boolean
    /**
     * Skip empty lines in the input.
     * Default: true
     */
    skipEmptyLines?: boolean

    fileEncoding?: string

    chunkCallback?: (data: IDataFrame<number, T>) => Promise<void>
    errorCallback?: (err: Error) => Promise<void>
    completeCallback?: () => Promise<void>
}