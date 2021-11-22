import { IDataFrame } from '../core'
import { ICsvFileReader } from './ICsvFileReader'
import { ICsvOptions } from './ICsvOptions'
import { fromCSV } from './fromCSV'
import { isObject } from 'hk-utils'
import { readFileDataByFs } from './readFileDataByFs'

export class CsvFilereader implements ICsvFileReader {
    constructor(protected filePath: string) {}

    async parseCSV(config?: ICsvOptions): Promise<IDataFrame<number, any>> {
        if (config && !isObject(config)) {
            throw new Error('Expected optional \'config\' parameter to dataForge.readFile(...).parseCSV(...) to be an object with configuration options for CSV parsing.')
        }
        
        const fileData = await readFileDataByFs(this.filePath)
        return fromCSV(fileData, config)
    }
}