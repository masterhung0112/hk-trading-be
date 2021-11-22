import { isArray, isFunction, isObject, isString } from 'hk-utils'
import { ICsvOptions } from './ICsvOptions'
import { DataFrame } from '../core/DataFrame'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import PapaParse from 'papaparse'

export function fromCSV(csvTextString: string, config?: ICsvOptions) {
    if (!isString(csvTextString)) throw new Error('Expected \'csvTextString\' parameter to \'dataForge.fromCSV\' to be a string containing data encoded in the CSV format.')

    if (config) {
        if (!isObject(config)) throw new Error('Expected \'config\' parameter to \'dataForge.fromCSV\' to be an object with CSV parsing configuration options.')

        if (config.columnNames) {
            if (!isFunction(config.columnNames[Symbol.iterator])) {
                if (!isArray(config.columnNames)) throw new Error('Expect \'columnNames\' field of \'config\' parameter to DataForge.fromCSV to be an array or iterable of strings that specifies column names.')
            }


            for (const columnName of config.columnNames) {
                if (!isString(columnName)) throw new Error('Expect \'columnNames\' field of \'config\' parameter to DataForge.fromCSV to be an array of strings that specify column names.')
            }
        }
        
        if (config.skipEmptyLines === undefined) {
            config = Object.assign({}, config) // Clone the config. Don't want to modify the original.
            config.skipEmptyLines = true
        }
    }
    else {
        config = {
            skipEmptyLines: true,
        }
    }

    const parsed = PapaParse.parse(csvTextString, config as any)
    let rows = <string[][]> parsed.data

    if (rows.length === 0) {
        return new DataFrame<number, any>()
    }

    let columnNames
    rows = rows.map(row => {
            return row.map(cell => isString(cell) ? cell.trim() : cell) // Trim each cell that is still a string.
        })

    if (config && config.columnNames) {
        columnNames = config.columnNames
    }
    else {
        columnNames = rows.shift()
    }

    return new DataFrame<number, any>({
        rows: rows,
        columnNames: columnNames,
    })
}