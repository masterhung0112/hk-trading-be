import { EmptyIterable } from '../iterables/EmptyIterable'
import { isFunction } from '../utils/isFunction'
import { isArray } from '../utils/isArray'
import { CountIterable } from '../iterables/CountIterable'
import { MultiIterable } from '../iterables/MultiTerable'
import { ExtractElementIterable } from '../iterables/ExtractElementIterable'
import Table from 'easy-table'
import { ISeries } from './ISeries'
import { ISeriesContent } from './ISeriesContent'
import { SeriesConfigFn } from './SeriesConfigFn'
import { ISeriesConfig } from './ISeriesConfig'
import { SelectorWithIndexFn } from './SelectorWithIndexFn'
import { IDataFrame } from './IDataFrame'
import { DataFrame } from '.'
import { SelectIterable } from '../iterables/SelectIterable'
import { PredicateFn } from './PredicateFn'

/**
 * One-dimensional ndarray with axis labels (including time series).
 * The object supports both integer- and label-based indexing and provides a host of methods for performing operations involving the index.
 * Operations between Series (+, -, /, , *) align values based on their associated index values– they need not be the same length.
 * @param {data} data Array, JSON of 1D values
 * @param {kwargs} Object {columns: column names, dtypes : data type of values}
 *
 * @returns Series
 */
export class Series<IndexT = number, ValueT = any> implements ISeries<IndexT, ValueT> {
    private static readonly _defaultEmptyIterable = new EmptyIterable();
    private static readonly _defaultCountIterable = new CountIterable();

    private _content: ISeriesContent<IndexT, ValueT> | null = null
    private _configFn: SeriesConfigFn<IndexT, ValueT> | null = null

    constructor(config?: Iterable<ValueT> | ISeriesConfig<IndexT, ValueT> | SeriesConfigFn<IndexT, ValueT>) {
       if (config) {
        if (isFunction(config)) {
            this._configFn = config
        } else if (isArray(config) ||
            isFunction((config as any)[Symbol.iterator])) {
                this._content = Series._initFromArray(config as Iterable<ValueT>)
            } else {
                this._content = Series._initFromConfig(config as ISeriesConfig<IndexT, ValueT>)
            }
       } else {
           this._content = Series._initEmpty()
       }
    }

    private static _initFromArray<IndexT, ValueT>(arr: Iterable<ValueT>): ISeriesContent<IndexT, ValueT> {
        return {
            index: Series._defaultCountIterable,
            values: arr,
            pairs: new MultiIterable([Series._defaultCountIterable, arr]),
            isBaked: true,
        }
    }

    private static _initEmpty<IndexT, ValueT>(): ISeriesContent<IndexT, ValueT> {
        return {
            index: Series._defaultEmptyIterable,
            values: Series._defaultEmptyIterable,
            pairs: Series._defaultEmptyIterable,
            isBaked: true,
        }
    }

    private static _checkIterable<T>(input: T[] | Iterable<T>, fieldName: string): void {
        if (isArray(input)) {
            // OK
        }
        else if (isFunction(input[Symbol.iterator])) {
            // OK
        } else {
            throw new Error(`Expected ${fieldName} field of Series config Object to be an array of values or an iterable of values`)
        }
    }

    private static _initFromConfig<IndexT, ValueT>(config: ISeriesConfig<IndexT, ValueT>): ISeriesContent<IndexT, ValueT> {
        let index: Iterable<IndexT>
        let values: Iterable<ValueT>
        let pairs: Iterable<[IndexT, ValueT]> | undefined
        let isBaked = false

        if (config.pairs) {
            Series._checkIterable(config.pairs, 'pairs')
            pairs = config.pairs
        }

        if (config.index) {
            Series._checkIterable(config.index, 'index')
            index = config.index
        } else if (pairs) {
            index = new ExtractElementIterable(pairs, 0)
        } else {
            index = Series._defaultCountIterable
        }

        if (config.values) {
            Series._checkIterable(config.values, 'values')
            values = config.values
        } else if (pairs) {
            values = new ExtractElementIterable(pairs, 1)
        } else {
            values = Series._defaultEmptyIterable
        }

        if (!pairs) {
            pairs = new MultiIterable([index, values])
        }

        if (config.baked !== undefined) {
            isBaked = config.baked
        }

        return {
            index: index,
            values: values,
            pairs: pairs,
            isBaked: isBaked,
        }
    }

    private _lazyInit() {
        if (this._content === null && this._configFn !== null) {
            this._content = Series._initFromConfig(this._configFn())
        }
    }

    get content(): ISeriesContent<IndexT, ValueT> {
        this._lazyInit()
        return this._content!
    }

    [Symbol.iterator](): Iterator<ValueT> {
        return this.content.values[Symbol.iterator]()
    }

    min(): number {
        let min : number | undefined

        for (const value of this) {
            if (value === null || value === undefined) {
                continue
            }

            const numberValue = value as any as number
            if (min === undefined) {
                min = numberValue
            } else {
                min = Math.min(min, numberValue)
            }
        }

        if (min === undefined) {
            return 0
        }
        return min
    }

    max(): number {
        let max : number | undefined

        for (const value of this) {
            if (value === null || value === undefined) {
                continue
            }

            const numberValue = value as any as number
            if (max === undefined) {
                max = numberValue
            } else {
                max = Math.max(max, numberValue)
            }
        }

        if (max === undefined) {
            return 0
        }
        return max
    }

    toPairs(): ([IndexT, ValueT])[] {
        const pairs = []
        for (const pair of this.content.pairs) {
            if (pair[1] !== undefined && pair[1] !== null) {
                pairs.push(pair)
            }
        }
        return pairs
    }

    inflate<ToT = ValueT>(selector?: SelectorWithIndexFn<ValueT, ToT>): IDataFrame<IndexT, ToT> {
        if (selector) {
            if (!isFunction(selector)) throw new Error('Expected \'selector\' parameter to Series.inflate to be a selector function.')
            return new DataFrame<IndexT, ToT>(() => {
                const content = this.content
                return {
                    values: new SelectIterable(content.values, selector),
                    index: content.index,
                    pairs: new SelectIterable(content.pairs, (pair: [IndexT, ValueT], index: number): [IndexT, ToT] => [pair[0], selector(pair[1], index)])
                }
            })
        } else {
            return new DataFrame<IndexT, ToT>(() => {
                const content = this.content
                return {
                    values: <Iterable<ToT>> <any> content.values,
                    index: content.index,
                    pairs: <Iterable<[IndexT, ToT]>> <any> content.pairs
                }
            })
        }
    }

    any(predicate?: PredicateFn<ValueT>): boolean {
        if (predicate) {
            if (!isFunction(predicate)) throw new Error("Expected 'predicate' parameter to 'Series.any' to be a function.")

            for (const value of this) {
                if (predicate(value)) {
                    return true
                }
            }
        } else {
            // Just check if there is at least one item
            const iterator = this[Symbol.iterator]()
            return !iterator.next().done
        }

        return false
    }

    first(): ValueT {
        for (const value of this) {
            return value; // Only need the first value.
        }

        throw new Error("Series.first: No values in Series.")
    }

    last(): ValueT {
        let lastValue = null;

        for (const value of this) {
            lastValue = value; // Throw away all values until we get to the last one.
        }

        if (lastValue === null) {
            throw new Error("Series.last: No values in Series.");
        }

        return lastValue;
    } 

    toString() {
        const header = ['__index__', '__value__']
        const rows = this.toPairs()

        const table = new Table()

        for (let rowIndex = 0; rowIndex < rows.length; ++rowIndex) {
            const row = rows[rowIndex]
            for (let cellIndex = 0; cellIndex < row.length; ++cellIndex) {
                const cell = row[cellIndex]
                table.cell(header[cellIndex], cell)
            }
            table.newRow()
        }

        return table.toString()
    }

    print() {
        console.log(this + '')
    }
}