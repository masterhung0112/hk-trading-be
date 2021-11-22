import { IDataFrame } from '../core/IDataFrame'
import { ICsvOptions } from './ICsvOptions'

export interface ICsvFileReader {
    parseCSV(config?: ICsvOptions): Promise<IDataFrame<number, any>>
}