import { ISeries } from './ISeries'
import { SeriesSelectorFn } from './SeriesSelectorFn'

export interface IColumnGenSpec { //todo: this should allow iterable as well!
    [index: string]: ISeries<any, any> | SeriesSelectorFn<any, any, any>,
}