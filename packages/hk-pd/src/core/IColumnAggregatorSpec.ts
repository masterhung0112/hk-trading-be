import { SeriesAggregatorFn } from './SeriesAggregatorFn'

export interface IColumnAggregatorSpec {
    [outputColumnName: string]: SeriesAggregatorFn<any, any, any>,
} 

export interface IMultiColumnAggregatorSpec {
    [inputColumnName: string]: SeriesAggregatorFn<any, any, any> | IColumnAggregatorSpec;
}