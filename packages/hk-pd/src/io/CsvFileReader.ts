import { IDataFrame } from '../core'
import { ICsvFileReader } from './ICsvFileReader'
import { ICsvOption } from './ICsvOption'
import { fromCSV } from './fromCSV'
import { isObject } from 'hk-utils'
import { readFileDataByFs } from './readFileDataByFs'

export class CsvFileReader implements ICsvFileReader {
    constructor(protected filePath: string) {}


    async parseCSV<T = any>(config: ICsvOption): Promise<IDataFrame<number, T>> {
        if (config && !isObject(config)) {
            throw new Error('Expected optional \'config\' parameter to dataForge.readFile(...).parseCSV(...) to be an object with configuration options for CSV parsing.')
        }

        if (config?.chunkCallback) {
            throw new Error('expected chunkCallback is mpt available')
        }
        
        const fileData = await readFileDataByFs(this.filePath, config.fileEncoding)
        return fromCSV(fileData, config) as IDataFrame<number, T>
    }

    async parseCSVStep<T = any>(config?: ICsvOption<T>): Promise<void> {
        if (config && !isObject(config)) {
            throw new Error('Expected optional \'config\' parameter to dataForge.readFile(...).parseCSV(...) to be an object with configuration options for CSV parsing.')
        }

        if (!config?.chunkCallback) {
            throw new Error('expected chunkCallback is available')
        }
        
        const fileData = await readFileDataByFs(this.filePath, config!.fileEncoding)
        fromCSV(fileData, config)
    }
}