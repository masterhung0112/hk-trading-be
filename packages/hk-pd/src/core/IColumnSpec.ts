import { ISeries } from './ISeries'

export interface IColumnSpec {
    [index: string]: Iterable<any> | ISeries<any, any>
}