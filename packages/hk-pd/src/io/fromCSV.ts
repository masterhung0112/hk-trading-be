import { isArray, isFunction, isObject, isString } from '@hungknow/utils'
import { ICsvOption } from './ICsvOption'
import { DataFrame } from '../core/DataFrame'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import PapaParse from 'papaparse'

function processRow(config: ICsvOption | undefined, parsed: any, columnNames: string[] | any) {
    // if (parsed.errors) {
    //     console.error(parsed.errors)
    // }
    let rows = <string[][]> parsed.data

    if (rows.length === 0) {
        return new DataFrame<number, any>()
    }

    rows = rows.map(row => {
            return row.map(cell => isString(cell) ? cell.trim() : cell) // Trim each cell that is still a string.
        })

    if (config && config.columnNames) {
        columnNames = config.columnNames
    }
    else if (!columnNames) {
        columnNames = rows.shift()
    }

    return new DataFrame<number, any>({
        rows: rows,
        columnNames: columnNames,
    })
}

export function fromCSV(csvTextString: string, config?: ICsvOption) {
    if (!isString(csvTextString)) throw new Error('Expected \'csvTextString\' parameter to \'dataForge.fromCSV\' to be a string containing data encoded in the CSV format.')

    let columnNames: string[] | null = null

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

        if (config.chunkCallback) {
            const chunkCallback = config.chunkCallback
            const errCb = (err: Error) => { console.error(err) }

            config = Object.assign({
                chunk: async (parsed: any, parser: any) => {
                    parser.pause()
                    const data = processRow(config, parsed, columnNames)
                    if (!columnNames) {
                        columnNames = data.getColumnNames()
                    }
                    await chunkCallback(data)
                    parser.resume()
                },
                error: config.errorCallback || errCb,
                chunkSize: 1024 * 512, // 512KB
                complete: config.completeCallback
            }, config)
        }
    }
    else {
        config = {
            skipEmptyLines: true,
        }
    }

    const parsed = PapaParse.parse(csvTextString, config as any)

    if (!config.chunkCallback) {
        return processRow(config, parsed, columnNames)
    }
}