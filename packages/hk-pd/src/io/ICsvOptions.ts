export interface ICsvOptions {
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
}