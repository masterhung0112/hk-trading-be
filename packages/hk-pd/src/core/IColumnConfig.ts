import { ISeries } from './ISeries'

export interface IColumnConfig {
    name: string
    series: Iterable<any> | ISeries<any, any>
}