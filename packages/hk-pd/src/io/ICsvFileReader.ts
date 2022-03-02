import { IDataFrame } from '../core/IDataFrame'
import { ICsvOption } from './ICsvOption'

export interface ICsvFileReader {
    parseCSV<T = any>(config?: ICsvOption<T>): Promise<IDataFrame<number, T>>
    parseCSVStep<T = any>(config?: ICsvOption<T>): Promise<void>
}