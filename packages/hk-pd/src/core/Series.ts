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
import { SelectManyIterable } from '../iterables/SelectManyIterable'
import { isString } from '../utils/isString'
import moment from 'dayjs'
import { isDate } from '../utils/isDate'
import { isNumber } from '../utils/isNumber'
import { toMap } from '../utils/toMap'
import { WhichIndex } from './WhichIndex'
import { Index } from './IndexT'
import { IIndex } from './IIndex'
import { SeriesWindowIterable } from '../iterables/SeriesWindowIterable'
import { SeriesRollingWindowIterable } from '../iterables/SeriesRollingWindowIterable'
import { ComparerFn } from './ComparerFn'
import { SeriesVariableWindowIterable } from '../iterables/SeriesVariableWindowIterable'
import { SelectorFn } from './SelectorFn'
import { AggregateFn } from './AggregateFn'
import { SkipIterable } from '../iterables/SkipIterable'
import { TakeIterable } from '../iterables/TakeIterable'
import { WhereIterable } from '../iterables/WhereIterable'
import { CallbackFn } from './CallbackFn'
import { SkipWhileIterable } from '../iterables/SkipWhileIterable'
import { TakeWhileIterable } from '../iterables/TakeWhileIterable'

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

    getContent(): ISeriesContent<IndexT, ValueT> {
        this._lazyInit()
        return this._content!
    }

    [Symbol.iterator](): Iterator<ValueT> {
        return this.getContent().values[Symbol.iterator]()
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

    none(predicate?: PredicateFn<ValueT>): boolean {

        if (predicate) {
            if (!isFunction(predicate)) throw new Error('Expected \'predicate\' parameter to \'Series.none\' to be a function.')
        }

        if (predicate) {
            // Use the predicate to check each value.
            for (const value of this) {
                if (predicate(value)) {
                    return false
                }
            }
        }
        else {
            // Just check if empty.
            const iterator = this[Symbol.iterator]()
            return iterator.next().done
        }

        return true // Nothing failed the predicate.
    }

    toPairs(): ([IndexT, ValueT])[] {
        const pairs = []
        for (const pair of this.getContent().pairs) {
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
                const content = this.getContent()
                return {
                    values: new SelectIterable(content.values, selector),
                    index: content.index,
                    pairs: new SelectIterable(content.pairs, (pair: [IndexT, ValueT], index: number): [IndexT, ToT] => [pair[0], selector(pair[1], index)])
                }
            })
        } else {
            return new DataFrame<IndexT, ToT>(() => {
                const content = this.getContent()
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
            if (!isFunction(predicate)) throw new Error('Expected \'predicate\' parameter to \'Series.any\' to be a function.')

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

    head(numValues: number): ISeries<IndexT, ValueT> {
        if (!isNumber(numValues)) throw new Error('Expected \'numValues\' parameter to \'Series.head\' function to be a number.')

        if (numValues === 0) {
            return new Series<IndexT, ValueT>()
        }

        const toTake = numValues < 0 ? this.count() - Math.abs(numValues) : numValues
        return this.take(toTake)
    }

    first(): ValueT {
        for (const value of this) {
            return value // Only need the first value.
        }

        throw new Error('Series.first: No values in Series.')
    }

    forEach(callback: CallbackFn<ValueT>): ISeries<IndexT, ValueT> {
        if (!isFunction(callback)) throw new Error('Expected \'callback\' parameter to \'Series.forEach\' to be a function.')

        let index = 0
        for (const value of this) {
            callback(value, index++)
        }

        return this
    }

    last(): ValueT {
        let lastValue = null

        for (const value of this) {
            lastValue = value // Throw away all values until we get to the last one.
        }

        if (lastValue === null) {
            throw new Error('Series.last: No values in Series.')
        }

        return lastValue
    }

    count(): number {
        let total = 0
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const value of this.getContent().values) {
            ++total
        }
        return total
    }

    endAt(indexValue: IndexT): ISeries<IndexT, ValueT> {
        return new Series<IndexT, ValueT>(() => {
            const lessThanOrEqualTo = this.getIndex().getLessThanOrEqualTo()
            return {
                index: new TakeWhileIterable(this.getContent().index, index => lessThanOrEqualTo(index, indexValue)),
                pairs: new TakeWhileIterable(this.getContent().pairs, pair => lessThanOrEqualTo(pair[0], indexValue)),
            }
        })
    }

    select<ToT>(selector: SelectorWithIndexFn<ValueT, ToT>): ISeries<IndexT, ToT> {
        if (!isFunction(selector)) throw new Error('Expected \'selector\' parameter to \'Series.select\' function to be a function.')

        return new Series(() => ({
            values: new SelectIterable(this.getContent().values, selector),
            index: this.getContent().index,
        }))
    }

    selectMany<ToT>(selector: SelectorWithIndexFn<ValueT, Iterable<ToT>>): ISeries<IndexT, ToT> {
        if (!isFunction(selector)) throw new Error('Expected \'selector\' parameter to \'Series.selectMany\' to be a function.')

        return new Series(() => ({
            pairs: new SelectManyIterable(
                this.getContent().pairs,
                (pair: [IndexT, ValueT], index: number): Iterable<[IndexT, ToT]> => {
                    const outputPairs: [IndexT, ToT][] = []
                    for (const transformed of selector(pair[1], index)) {
                        outputPairs.push([
                            pair[0],
                            transformed
                        ])
                    }
                    return outputPairs
                }
            )
        }))
    }

    static parseInt(value: any | undefined | null, valueIndex: number): number | undefined {
        if (value === undefined || value === null) {
            return undefined
        }
        else {
            if (!isString(value)) {
                throw new Error('Called Series.parseInts, expected all values in the series to be strings, instead found a \'' + typeof(value) + '\' at index ' + valueIndex)
            }

            if (value.length === 0) {
                return undefined
            }

            return parseInt(value)
        }
    }

    parseInts(): ISeries<IndexT, number> {
        return <ISeries<IndexT, number>> this.select(Series.parseInt)
    }

    static parseFloat (value: any | undefined | null, valueIndex: number): number | undefined {
        if (value === undefined || value === null) {
            return undefined
        }
        else {
            if (!isString(value)) throw new Error('Called Series.parseFloats, expected all values in the series to be strings, instead found a \'' + typeof(value) + '\' at index ' + valueIndex)

            if (value.length === 0) {
                return undefined
            }

            return parseFloat(value)
        }
    }

    parseFloats(): ISeries<IndexT, number> {
        return <ISeries<IndexT, number>> this.select(Series.parseFloat)
    }

    static parseDate(value: any | undefined | null, valueIndex: number, formatString?: string): Date | undefined {
        if (value === undefined || value === null) {
            return undefined
        }
        else {
            if (!isString(value)) throw new Error('Called Series.parseDates, expected all values in the series to be strings, instead found a \'' + typeof(value) + '\' at index ' + valueIndex)

            if (value.length === 0) {
                return undefined
            }

            return moment(value, formatString).toDate()
        }
    }

    parseDates(formatString?: string): ISeries<IndexT, Date> {
        if (formatString) {
            if (!isString(formatString)) throw new Error('Expected optional \'formatString\' parameter to Series.parseDates to be a string (if specified).')
        }

        return <ISeries<IndexT, Date>> this.select((value: any | undefined, valueIndex: number) => Series.parseDate(value, valueIndex, formatString))
    }

    static toString(value: any | undefined | null, formatString?: string): string | undefined | null {
        if (value === undefined) {
            return undefined
        }
        else if (value === null) {
            return null
        }
        else if (formatString && isDate(value)) {
            return moment(value).format(formatString)
        }
        else if (formatString && isNumber(value)) {
            return numeral(value).format(formatString)
        }
        else {
            return value.toString()
        }		
    }

    toStrings(formatString?: string): ISeries<IndexT, string> {
        if (formatString) {
            if (!isString(formatString)) throw new Error('Expected optional \'formatString\' parameter to Series.toStrings to be a string (if specified).')
        }

        return <ISeries<IndexT, string>> this.select(value => Series.toString(value, formatString))
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

    toArray(): any[] {
        const values = []
        for (const value of this.getContent().values) {
            if (value !== undefined && value !== null) {
                values.push(value)
            }
        }
        return values
    }

    toObject<KeyT = any, FieldT = any, OutT = any>(keySelector: (value: ValueT) => KeyT, valueSelector: (value: ValueT) => FieldT): OutT {
        if (!isFunction(keySelector))throw new Error('Expected \'keySelector\' parameter to Series.toObject to be a function.')
        if (!isFunction(valueSelector)) throw new Error('Expected \'valueSelector\' parameter to Series.toObject to be a function.')

        return toMap(this, keySelector, valueSelector)
    }


    bake(): ISeries<IndexT, ValueT> {
        if (this.getContent().isBaked) {
            // Already baked.
            return this
        }

        return new Series<IndexT, ValueT>({
            values: this.toArray(),
            pairs: this.toPairs(),
            baked: true,
        })
    }

    before(indexValue: IndexT): ISeries<IndexT, ValueT> {
        return new Series<IndexT, ValueT>(() => {
            const lessThan = this.getIndex().getLessThan()
            return {
                index: new TakeWhileIterable(this.getContent().index, index => lessThan(index, indexValue)),
                pairs: new TakeWhileIterable(this.getContent().pairs, pair => lessThan(pair[0], indexValue)),
            }
        })
    }

    between(startIndexValue: IndexT, endIndexValue: IndexT): ISeries<IndexT, ValueT> {
        return this.startAt(startIndexValue).endAt(endIndexValue)
    }

    print() {
        console.log(this + '')
    }

    getIndex(): IIndex<IndexT> {
        return new Index<IndexT>(() => ({
            values: this.getContent().index
        }))
    }
    
    window(period: number, whichIndex?: WhichIndex): ISeries<IndexT, ISeries<IndexT, ValueT>> {
        if (!isNumber(period)) throw new Error('Expected \'period\' parameter to \'Series.window\' to be a number.')

        return new Series<IndexT, ISeries<IndexT, ValueT>>(() => ({
            pairs: new SeriesWindowIterable<IndexT, ValueT>(
                this.getContent().pairs,
                period,
                whichIndex || WhichIndex.End
            )
        }))
    }

    rollingWindow(period: number, whichIndex?: WhichIndex): ISeries<IndexT, ISeries<IndexT, ValueT>> {
        if (!isNumber(period)) throw new Error('Expected \'period\' parameter to \'Series.rollingWindow\' to be a number.')

        return new Series<IndexT, ISeries<IndexT, ValueT>>(() => ({
            pairs: new SeriesRollingWindowIterable<IndexT, ValueT>(this.getContent().pairs, period, whichIndex || WhichIndex.End)
        }))
    }

    variableWindow(comparer: ComparerFn<ValueT, ValueT>): ISeries<number, ISeries<IndexT, ValueT>> {
        if (!isFunction(comparer)) throw new Error('Expected \'comparer\' parameter to \'Series.variableWindow\' to be a function.')

        return new Series<number, ISeries<IndexT, ValueT>>(() => ({
            values: new SeriesVariableWindowIterable<IndexT, ValueT>(this.getContent().pairs, comparer)
        }))
    }

    sequentialDistinct<ToT = ValueT>(selector?: SelectorFn<ValueT, ToT>): ISeries<IndexT, ValueT> {
        if (selector) {
            if (!isFunction(selector)) throw new Error('Expected \'selector\' parameter to \'Series.sequentialDistinct\' to be a selector function that determines the value to compare for duplicates.')
        } else {
            selector = (value: ValueT): ToT => <ToT> <any> value
        }
        return this.variableWindow((a, b) => selector(a) === selector(b))
            .select((window): [IndexT, ValueT] => {
                return [window.getIndex().first(), window.first()]
            })
            .withIndex(pair => pair[0])
            .select(pair => pair[1])
    }

    withIndex<NewIndexT>(newIndex: Iterable<NewIndexT> | SelectorFn<ValueT, NewIndexT>): ISeries<NewIndexT, ValueT> {
        if (isFunction(newIndex)) {
            return new Series<NewIndexT, ValueT>(() => ({
                values: this.getContent().values,
                index: this.select(newIndex)
            }))
        } else {
            Series._checkIterable(newIndex as Iterable<NewIndexT>, 'newIndex')

            return new Series<NewIndexT, ValueT>(() => ({
                values: this.getContent().values,
                index: newIndex as Iterable<NewIndexT>
            }))
        }
    }

    skip(numValues: number): ISeries<IndexT, ValueT> {
        return new Series<IndexT, ValueT>(() => ({
            values: new SkipIterable(this.getContent().values, numValues),
            index: new SkipIterable(this.getContent().index, numValues),
            pairs: new SkipIterable(this.getContent().pairs, numValues)
        }))
    }

    startAt(indexValue: IndexT): ISeries<IndexT, ValueT> {
        return new Series<IndexT, ValueT>(() => {
            const lessThan = this.getIndex().getLessThan()
            return {                
                index: new SkipWhileIterable(this.getContent().index, index => lessThan(index, indexValue)),
                pairs: new SkipWhileIterable(this.getContent().pairs, pair => lessThan(pair[0], indexValue)),
            }
        })
    }

    take(numRows: number): ISeries<IndexT, ValueT> {
        if (!isNumber(numRows)) throw new Error('Expected \'numRows\' parameter to \'Series.take\' function to be a number.')

        return new Series<IndexT, ValueT>(() => ({
            index: new TakeIterable(this.getContent().index, numRows),
            values: new TakeIterable(this.getContent().values, numRows),
            pairs: new TakeIterable(this.getContent().pairs, numRows),
        }))
    }

    tail(numValues: number): ISeries<IndexT, ValueT> {
        if (!isNumber(numValues)) throw new Error('Expected \'numValues\' parameter to \'Series.tail\' function to be a number.')

        if (numValues === 0) {
            return new Series<IndexT, ValueT>()
        }

        const toSkip = numValues > 0 ? this.count() - numValues : Math.abs(numValues)
        return this.skip(toSkip)
    }

    where(predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT> {
        if (!isFunction(predicate)) throw new Error('Expected \'predicate\' parameter to \'Series.where\' function to be a function.')

        return new Series(() => ({
            values: new WhereIterable(this.getContent().values, predicate),
            pairs: new WhereIterable(this.getContent().pairs, pair => predicate(pair[1]))
        }))
    }

    after(indexValue: IndexT): ISeries<IndexT, ValueT> {
        return new Series<IndexT, ValueT>(() => {
            const lessThanOrEqualTo = this.getIndex().getLessThanOrEqualTo()
            return {
                index: new SkipWhileIterable(this.getContent().index, index => lessThanOrEqualTo(index, indexValue)),
                pairs: new SkipWhileIterable(this.getContent().pairs, pair => lessThanOrEqualTo(pair[0], indexValue)),
            }
        })
    }

    aggregate<ToT = ValueT>(seedOrSelector: AggregateFn<ValueT, ToT> | ToT, selector?: AggregateFn<ValueT, ToT>): ToT {
        if (isFunction(seedOrSelector) && !selector) {
            return this.skip(1).aggregate(<ToT> <any> this.first(), seedOrSelector)
        } else {
            if (!isFunction(selector)) throw new Error('Expected \'selector\' parameter to aggregate to be a function.')

            let accum = <ToT> seedOrSelector

            for (const value of this) {
                accum = selector!(accum, value)
            }

            return accum
        }
    }

    all(predicate: PredicateFn<ValueT>): boolean {
        if (!isFunction(predicate)) throw new Error('Expected \'predicate\' parameter to \'Series.all\' to be a function.')

        let count = 0

        for (const value of this) {
            if (!predicate(value)) {
                return false
            }

            ++count
        }

        return count > 0
    }

    amountRange(period: number, whichIndex?: WhichIndex): ISeries<IndexT, number> {
        return (<ISeries<IndexT, number>> <any> this) // Have to assume this is a number series.
            .rollingWindow(period, whichIndex)
            .select(window => window.max() - window.min())
    }

    proportionRange(period: number, whichIndex?: WhichIndex): ISeries<IndexT, number> {
        return (<ISeries<IndexT, number>> <any> this) // Have to assume this is a number series.
            .rollingWindow(period, whichIndex)
            .select(window => (window.max() - window.min()) / window.last())
    }

    percentRange(period: number, whichIndex?: WhichIndex): ISeries<IndexT, number> {
        return this.proportionRange(period, whichIndex).select(v => v * 100)
    }

    amountChange(period?: number, whichIndex?: WhichIndex): ISeries<IndexT, number> {
        return (<ISeries<IndexT, number>> <any> this) // Have to assume this is a number series.
            .rollingWindow(period === undefined ? 2 : period, whichIndex)
            .select(window => window.last() - window.first())
    }

    proportionChange(period?: number, whichIndex?: WhichIndex): ISeries<IndexT, number> {
        return (<ISeries<IndexT, number>> <any> this) // Have to assume this is a number series.
            .rollingWindow(period === undefined ? 2 : period, whichIndex)
            .select(window => (window.last() - window.first())  / window.first())
    }

    percentChange(period?: number, whichIndex?: WhichIndex): ISeries<IndexT, number> {
        return this.proportionChange(period, whichIndex).select(v => v * 100)
    }

    proportionRank(period?: number): ISeries<IndexT, number> {
        if (period === undefined) {
            period = 2
        }

        if (!isNumber(period)) {
            throw new Error('Expected \'period\' parameter to \'Series.proportionRank\' to be a number that specifies the time period for the ranking.')
        }
    
        return this.rollingWindow(period+1) // +1 to account for the last value being used.
            .select(window => {
                const latestValue = window.last()
                const numLowerValues = window.head(-1).where(prevMomentum => prevMomentum < latestValue).count()
                const proportionRank = numLowerValues / period!
                return proportionRank
            })
    }
}