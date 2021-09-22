import { data } from '@tensorflow/tfjs'
import { DataType, TensorContainer } from '@tensorflow/tfjs-node'
import { DataFrame } from '../core/DataFrame'
import { IDataFrame } from '../core/IDataFrame'

export interface ColumnConfig {
    required?: boolean
    dtype?: DataType
    default?: TensorContainer
    isLabel?: boolean
}

export type CSVConfig = {
    /** @param start: The number of elements of this dataset that should be skipped
    *   to form the new dataset.  If `start` is greater than the size of this
    *   dataset, the new dataset will contain no elements.  If `start`
    *   is `undefined` or negative, skips the entire dataset. */
    start?: number
    end?: number

    /**
         * A boolean value that indicates whether the first row of provided CSV file
         * is a header line with column names, and should not be included in the data.
         */
    hasHeader?: boolean
    /**
     * A list of strings that corresponds to the CSV column names, in order. If
     * provided, it ignores the column names inferred from the header row. If not
     * provided, infers the column names from the first row of the records. If
     * `hasHeader` is false and `columnNames` is not provided, this method will
     * throw an error.
     */
    columnNames?: string[]
    /**
     * A dictionary whose key is column names, value is an object stating if this
     * column is required, column's data type, default value, and if this column
     * is label. If provided, keys must correspond to names provided in
     * `columnNames` or inferred from the file header lines. If any column is
     * marked as label, the .csv() API will return an array of two items: the
     * first item is a dict of features key/value pairs, the second item is a dict
     * of labels key/value pairs. If no column is marked as label returns a dict
     * of features only.
     *
     * Has the following fields:
     * - `required` If value in this column is required. If set to `true`, throw
     * an error when it finds an empty value.
     *
     * - `dtype` Data type of this column. Could be int32, float32, bool, or
     * string.
     *
     * - `default` Default value of this column.
     *
     * - `isLabel` Whether this column is label instead of features. If isLabel is
     * `true` for at least one column, the element in returned `CSVDataset` will
     * be an object of {xs: features, ys: labels}: xs is a dict of features
     * key/value pairs, ys is a dict of labels key/value pairs. If no column is
     * marked as label, returns a dict of features only.
     */
    columnConfigs?: {
        [key: string]: ColumnConfig;
    };
    /**
     * If true, only columns provided in `columnConfigs` will be parsed and
     * provided during iteration.
     */
    configuredColumnsOnly?: boolean;
    /**
     * The string used to parse each line of the input file.
     */
    delimiter?: string;
    /**
     * If true, delimiter field should be null. Parsing delimiter is whitespace
     * and treat continuous multiple whitespace as one delimiter.
     */
    delimWhitespace?: boolean;
}

/**
 * Reads a CSV file from local or remote storage
 * @param {string} source URL to CSV file
 * @param {object} config (Optional). A CSV Config object that contains configurations
 *     for reading and decoding from CSV file(s).
 *                { start: The index position to start from when reading the CSV file.
 *
 *                end: The end position to stop at when reading the CSV file.
 *
 *                ...csvConfigs: other supported Tensorflow csvConfig parameters. See https://js.tensorflow.org/api/latest/#data.csv 
 *                }
 *
 * @returns {Promise} DataFrame structure of parsed CSV data
 */
export async function readCsv(source?: any, csvConfig: CSVConfig = {}): Promise<IDataFrame> {
    const { start, end } = csvConfig
    
    if (!(source.startsWith('file://') || source.startsWith('http') || source.startsWith('blob'))) {
        //probabily a relative path, append file:// to it
        source = source.startsWith('/') ? `file://${source}` : `file://${process.cwd()}/${source}`
    }

    const tfdata = []
    await data.csv(source, csvConfig)
        .skip(start)
        .take(end)
        .forEachAsync((row) => {
            return tfdata.push(row)
        })
    return new DataFrame(tfdata)
}