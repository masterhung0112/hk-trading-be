/**
 * Options for CSV output.
 * 
 * The options object is passed directly to [PapaParse.unparse](https://www.papaparse.com/docs#unparse), please see [PapaParse docs for additional options](https://www.papaparse.com/docs#unparse-config-default).
 */
 export interface ICSVOutputOptions {
    /**
     * Enable or disable output of the CSV header line.
     * Defaults to true.
     */
    header?: boolean;
}