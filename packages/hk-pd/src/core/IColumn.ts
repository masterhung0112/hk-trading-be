import { ISeries } from './ISeries'

export interface IColumn {
    // The name of column
    name: string

    // The data type of column
    type: string
    
    // The data series from the columns
    series: ISeries<any, any>
}