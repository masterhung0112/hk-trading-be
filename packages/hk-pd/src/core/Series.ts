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
import { DataFrame } from './DataFrame'
import { SelectIterable } from '../iterables/SelectIterable'
import { PredicateFn } from './PredicateFn'
import { SelectManyIterable } from '../iterables/SelectManyIterable'
import { isString } from '../utils/isString'
import moment from 'dayjs'
import { isDate } from '../utils/isDate'
import { isNumber } from '../utils/isNumber'
import { toMap } from '../utils/toMap'
import { WhichIndex } from './WhichIndex'
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
import { IOrderedSeries } from './IOrderedSeries'
import { Direction } from './Direction'
import { OrderedIterable } from '../iterables/OrderedIterable'
import { ISortSpec } from './ISortSpec'
import { IOrderedSeriesConfig } from './IOrderedSeriesConfig'
import { SortSelectorFn } from './SortSelectorFn'
import { ReverseIterable } from '../iterables/ReverseIterable'
import { ConcatIterable } from '../iterables/ConcatIterable'
import { Zip2Fn, Zip3Fn, ZipNFn } from './ZipFn'
import { ZipIterable } from '../iterables/ZipIterable'
import { ITypeFrequency } from './ITypeFrequency'
import { IValueFrequency } from './IValueFrequency'
import { range } from './range'
import { replicate } from './replicate'
import { DistinctIterable } from '../iterables/DistinctIterable'
import { JoinFn } from './JoinFn'
import { IFrequencyTableEntry } from './IFrequencyTableEntry'
import { IFrequencyTableOptions } from './IFrequencyTableOptions'
import { GapFillFn } from './GapFillFn'
import { IIndex, IIndexPredicateFn } from './IIndex'
// import { Index } from './IndexT'
import { determineType } from '../utils/determineType'

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
    protected indexedContent: Map<any, ValueT> | null = null

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
            values: [], //Series._defaultEmptyIterable,
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

        // Convert values to Array type
        if (isBaked && !isArray(values)) {
            values = Array.from(values)
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

    static merge<MergedValueT = any, IndexT = any>(series: Iterable<ISeries<IndexT, any>>): ISeries<IndexT, MergedValueT[]> {

        const rowMap = new Map<IndexT, any[]>()
        const numSeries = Array.from(series).length //TODO: Be nice not to have to do this.
        let seriesIndex = 0
        for (const workingSeries of series) {
            for (const pair of workingSeries.toPairs()) {
                const index = pair[0]
                if (!rowMap.has(index)) {
                    rowMap.set(index, new Array(numSeries))
                }

                rowMap.get(index)![seriesIndex] = pair[1]
            }

            ++seriesIndex
        }

        const mergedPairs = Array.from(rowMap.keys())
            .map(index => [index, rowMap.get(index)] as [IndexT, MergedValueT[]])

        mergedPairs.sort((a, b) => { // Sort by index, ascending.
            if (a[0] === b[0]) {
                return 0
            }
            else if (a[0] > b[0]) {
                return 1
            }
            else {
                return -1
            }
        })

        return new Series<IndexT, MergedValueT[]>({
            pairs: mergedPairs,
        })
    }

    merge<MergedValueT = any>(...args: any[]): ISeries<IndexT, MergedValueT[]> {
        return Series.merge<MergedValueT, IndexT>([this].concat(args))
    }

    min(): number {
        let min: number | undefined

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

    static mode<IndexT = any>(series: ISeries<IndexT, any>): any {
        return series.mode()
    }

    mode(): any {
        if (this.none()) {
            return undefined
        }

        const lookup = new Map<any, number>()

        for (const value of this) {
            if (lookup.has(value)) {
                lookup.set(value, lookup.get(value)! + 1)
            }
            else {
                lookup.set(value, 1)
            }
        }

        const entries = Array.from(lookup.entries())
        entries.sort((a, b) => b[1] - a[1])
        return entries[0][0]
    }

    max(): number {
        let max: number | undefined

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

    map<ToT>(transformationFn: SelectorWithIndexFn<ValueT, ToT>): ISeries<IndexT, ToT> {
        if (!isFunction(transformationFn)) throw new Error('Expected \'transformationFn\' parameter to \'Series.map\' to be a function.')

        return new Series(() => ({
            values: new SelectIterable(this.getContent().values, transformationFn),
            index: this.getContent().index,
        }))
    }

    static mean<IndexT = any>(series: ISeries<IndexT, number>): number {
        return series.mean()
    }

    mean(): number {
        let total = 0
        let count = 0

        for (const value of this) {
            if (value === null || value === undefined) {
                continue // Skip empty values.
            }

            count += 1
            total += value as any as number // Assumes this is a number series.
        }

        if (count === 0) {
            return 0
        }

        return total / count
    }

    static median<IndexT = any>(series: ISeries<IndexT, number>): number {
        return series.median()
    }

    median(): number {
        //
        // From here: http://stackoverflow.com/questions/5275115/add-a-median-method-to-a-list
        //
        // Have to assume we are working with a number series here.
        const numberSeries = <ISeries<IndexT, number>><any>this.where(value => value !== null && value !== undefined)

        const count = numberSeries.count()
        if (count === 0) {
            return 0
        }

        const ordered = numberSeries.orderBy(value => value).toArray()
        if ((count % 2) == 0) {
            // Even.
            const a = ordered[count / 2 - 1]
            const b = ordered[count / 2]
            return (a + b) / 2
        }

        // Odd
        return ordered[Math.floor(count / 2)]
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
            return !!iterator.next().done
        }

        return true // Nothing failed the predicate.
    }

    orderBy<SortT>(selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT> {
        const content = this.getContent()
        return new OrderedSeries<IndexT, ValueT, SortT>({
            values: content.values,
            pairs: content.pairs,
            selector: selector,
            direction: Direction.Ascending,
            parent: null,
        })
    }

    orderByDescending<SortT>(selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT> {
        const content = this.getContent()
        return new OrderedSeries<IndexT, ValueT, SortT>({
            values: content.values, 
            pairs: content.pairs, 
            selector: selector, 
            direction: Direction.Descending, 
            parent: null,
        })
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
                    values: <Iterable<ToT>><any>content.values,
                    index: content.index,
                    pairs: <Iterable<[IndexT, ToT]>><any>content.pairs
                }
            })
        }
    }

    insertPair(pair: [IndexT, ValueT]): ISeries<IndexT, ValueT> {
        if (!isArray(pair)) throw new Error('Expected \'pair\' parameter to \'Series.insertPair\' to be an array.')
        if (pair.length !== 2) throw new Error('Expected \'pair\' parameter to \'Series.insertPair\' to be an array with two elements. The first element is the index, the second is the value.')

        return (new Series<IndexT, ValueT>({ pairs: [pair] })).concat(this)
    }

    intersection<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerSelector?: SelectorFn<ValueT, KeyT>,
        innerSelector?: SelectorFn<InnerValueT, KeyT>): 
            ISeries<IndexT, ValueT> {

        if (outerSelector) {
            if (!isFunction(outerSelector)) throw new Error('Expected optional \'outerSelector\' parameter to \'Series.intersection\' to be a function.')
        }
        else {
            outerSelector = value => <KeyT> <any> value
        }
        
        if (innerSelector) {
            if (!isFunction(innerSelector)) throw new Error('Expected optional \'innerSelector\' parameter to \'Series.intersection\' to be a function.')
        }
        else {
            innerSelector = value => <KeyT> <any> value
        }

        const outer = this
        return outer.where(outerValue => {
                const outerKey = outerSelector!(outerValue)
                return inner
                    .where(innerValue => outerKey === innerSelector!(innerValue))
                    .any()
            })
    }

    invert(): ISeries<IndexT, number | null | undefined> {
        return this
            .select(value => {
                if (value === null || value === undefined) {
                    return value as any
                }
                else {
                    return -(value as any as number) // Assume input is a number series.
                }
            })
    }

    join<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT, InnerValueT, ResultValueT>):
            ISeries<number, ResultValueT> {

        if (!isFunction(outerKeySelector)) throw new Error('Expected \'outerKeySelector\' parameter of \'Series.join\' to be a selector function.')
        if (!isFunction(innerKeySelector)) throw new Error('Expected \'innerKeySelector\' parameter of \'Series.join\' to be a selector function.')
        if (!isFunction(resultSelector)) throw new Error('Expected \'resultSelector\' parameter of \'Series.join\' to be a selector function.')

        const outer = this

        return new Series<number, ResultValueT>(() => {
            const innerMap = inner
                .groupBy(innerKeySelector)
                .toObject(
                    group => innerKeySelector(group.first()), 
                    group => group
                )

            const output: ResultValueT[] = []
            
            for (const outerValue of outer) { //TODO: There should be an enumerator that does this.
                const outerKey = outerKeySelector(outerValue)
                const innerGroup = innerMap[outerKey]
                if (innerGroup) {
                    for (const innerValue of innerGroup) {
                        output.push(resultSelector(outerValue, innerValue))
                    }    
                }
            }

            return {
                values: output
            }
        })
    }

    joinOuter<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            ISeries<number, ResultValueT> {

        if (!isFunction(outerKeySelector)) throw new Error('Expected \'outerKeySelector\' parameter of \'Series.joinOuter\' to be a selector function.')
        if (!isFunction(innerKeySelector)) throw new Error('Expected \'innerKeySelector\' parameter of \'Series.joinOuter\' to be a selector function.')
        if (!isFunction(resultSelector)) throw new Error('Expected \'resultSelector\' parameter of \'Series.joinOuter\' to be a selector function.')

        // Get the results in the outer that are not in the inner.
        const outer = this
        const outerResult = outer.except<InnerIndexT, InnerValueT, KeyT>(inner, outerKeySelector, innerKeySelector)
            .select(o => resultSelector(o, null))
            .resetIndex()

        // Get the results in the inner that are not in the outer.
        const innerResult = inner.except<IndexT, ValueT, KeyT>(outer, innerKeySelector, outerKeySelector)
            .select(i => resultSelector(null, i))
            .resetIndex()

        // Get the intersection of results between inner and outer.
        const intersectionResults = outer.join<KeyT, InnerIndexT, InnerValueT, ResultValueT>(inner, outerKeySelector, innerKeySelector, resultSelector)

        return outerResult
            .concat(intersectionResults)
            .concat(innerResult)
            .resetIndex()
    }

    joinOuterLeft<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            ISeries<number, ResultValueT> {

        if (!isFunction(outerKeySelector)) throw new Error('Expected \'outerKeySelector\' parameter of \'Series.joinOuterLeft\' to be a selector function.')
        if (!isFunction(innerKeySelector)) throw new Error('Expected \'innerKeySelector\' parameter of \'Series.joinOuterLeft\' to be a selector function.')
        if (!isFunction(resultSelector)) throw new Error('Expected \'resultSelector\' parameter of \'Series.joinOuterLeft\' to be a selector function.')

        // Get the results in the outer that are not in the inner.
        const outer = this
        const outerResult = outer.except<InnerIndexT, InnerValueT, KeyT>(inner, outerKeySelector, innerKeySelector)
            .select(o => resultSelector(o, null))
            .resetIndex()

        // Get the intersection of results between inner and outer.
        const intersectionResults = outer.join<KeyT, InnerIndexT, InnerValueT, ResultValueT>(inner, outerKeySelector, innerKeySelector, resultSelector)

        return outerResult
            .concat(intersectionResults)
            .resetIndex()
    }

    joinOuterRight<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            ISeries<number, ResultValueT> {

        if (!isFunction(outerKeySelector)) throw new Error('Expected \'outerKeySelector\' parameter of \'Series.joinOuterRight\' to be a selector function.')
        if (!isFunction(innerKeySelector)) throw new Error('Expected \'innerKeySelector\' parameter of \'Series.joinOuterRight\' to be a selector function.')
        if (!isFunction(resultSelector)) throw new Error('Expected \'resultSelector\' parameter of \'Series.joinOuterRight\' to be a selector function.')

        // Get the results in the inner that are not in the outer.
        const outer = this
        const innerResult = inner.except<IndexT, ValueT, KeyT>(outer, innerKeySelector, outerKeySelector)
            .select(i => resultSelector(null, i))
            .resetIndex()

        // Get the intersection of results between inner and outer.
        const intersectionResults = outer.join<KeyT, InnerIndexT, InnerValueT, ResultValueT>(inner, outerKeySelector, innerKeySelector, resultSelector)

        return intersectionResults
            .concat(innerResult)
            .resetIndex()
    }   

    static average<IndexT = any>(series: ISeries<IndexT, number>): number {
        return series.average()
    }

    average(): number {
        let total = 0
        let count = 0

        for (const value of this) {
            if (value === null || value === undefined) {
                continue // Skip empty values.
            }

            count += 1
            total += value as any as number // Assumes this is a number series.
        }

        if (count === 0) {
            return 0
        }

        return total / count
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

    fillGaps(comparer: ComparerFn<[IndexT, ValueT], [IndexT, ValueT]>, generator: GapFillFn<[IndexT, ValueT], [IndexT, ValueT]>): ISeries<IndexT, ValueT> {
        if (!isFunction(comparer)) throw new Error('Expected \'comparer\' parameter to \'Series.fillGaps\' to be a comparer function that compares two values and returns a boolean.')
        if (!isFunction(generator)) throw new Error('Expected \'generator\' parameter to \'Series.fillGaps\' to be a generator function that takes two values and returns an array of generated pairs to span the gap.')

        return this.rollingWindow(2)
            .selectMany((window): [IndexT, ValueT][] => {
                const pairs = window.toPairs()
                const pairA = pairs[0]
                const pairB = pairs[1]
                if (!comparer(pairA, pairB)) {
                    return [pairA]
                }

                const generatedRows = generator(pairA, pairB)
                if (!isArray(generatedRows)) throw new Error('Expected return from \'generator\' parameter to \'Series.fillGaps\' to be an array of pairs, instead got a ' + typeof(generatedRows))

                return [pairA].concat(generatedRows)
            })
            .withIndex(pair => pair[0])
            .select(pair => pair[1])
            .concat(this.tail(1))
    }

    frequency (options?: IFrequencyTableOptions): IDataFrame<number, IFrequencyTableEntry> {
        if (this.none()) {
            return new DataFrame()
        }

        return new DataFrame(() => {
            const numberSeries = this as any as ISeries<IndexT, number>

            const captureValues = options && options.captureValues || false

            let min = Number.MAX_VALUE
            let max = Number.MIN_VALUE
            let numValues = 0

            //
            // Compute min, max and total.
            //
            for (const value of numberSeries) {
                min = Math.min(value, min)
                max = Math.max(value, max)
                numValues += 1
            }

            let lower: number
            if (options && options.lower !== undefined) {
                lower = options.lower
            }
            else {
                lower = min
            }

            let upper: number
            if (options && options.upper !== undefined) {
                upper = options.upper
            }
            else {
                upper = max
            }

            let interval = options && options.interval

            const r = upper - lower
            let numGroups: number
            if (interval !== undefined) {
                numGroups = Math.ceil(r / interval)
            }
            else {
                numGroups = 10
            }
            
            if (numValues < numGroups) {
                numGroups = numValues
            }

            if (interval === undefined) {
                interval = r / (numGroups-1) 
            }

            const groups = new Array<IFrequencyTableEntry>(numGroups)

            // 
            // Initialize groups.
            //
            for (let groupIndex = 0; groupIndex < numGroups; ++groupIndex) {
                const minValue = lower + (groupIndex * interval)
                groups[groupIndex] = {
                    lower: minValue,
                    upper: minValue + interval,
                    count: 0,
                    proportion: 0,  
                    cumulative: 0,
                }

                if (captureValues) {
                    groups[groupIndex].values = []
                }
            }

            const beforeGroup: IFrequencyTableEntry = {
                upper: lower,
                count: 0,
                proportion: 0,  
                cumulative: 0,
            }
            if (captureValues) {
                beforeGroup.values = []
            }

            const afterGroup: IFrequencyTableEntry = {
                lower: upper,
                count: 0,
                proportion: 0,  
                cumulative: 0,
            }
            if (captureValues) {
                afterGroup.values = []
            }

            //
            // Count groups.
            //
            for (const value of numberSeries) {
                let group: IFrequencyTableEntry
                if (value < lower) {
                    group = beforeGroup // Value is less than the body of the data set.
                }
                else if (value > upper) {
                    group = afterGroup // Value is more than the body of the data set.
                }
                else {
                    const groupIndex = Math.floor((value - lower) / interval)
                    group = groups[groupIndex] // Value is within the body of the data set.
                }
                group.count += 1
                if (captureValues) {
                    group.values!.push(value)
                }
            }

            let cumulative = 0

            if (beforeGroup.count > 0) {
                groups.unshift(beforeGroup)
            }

            if (afterGroup.count > 0) {
                groups.push(afterGroup)
            }

            //
            // Compute proportions.
            //
            for (const group of groups) {
                group.proportion = group.count / numValues
                cumulative += group.proportion
                group.cumulative = cumulative 
            }

            return {
                values: groups,
            }
        })
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

    static count<IndexT = any>(series: ISeries<IndexT, number>): number {
        return series.count()
    }

    count(): number {
        const content = this.getContent()
        if (content.isBaked && isArray(content.values)) {
            return content.values.length
        }

        let total = 0
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const value of this.getContent().values) {
            ++total
        }
        return total
    }

    counter(predicate: PredicateFn<ValueT>): ISeries<IndexT, number> {
        return this.groupSequentialBy(predicate)
            .selectMany((group) => {
                if (predicate(group.first())) {
                    // This group matches the predicate.
                    return range(1, group.count())
                        .withIndex(group.getIndex())
                        .toPairs() //TODO: selectMany wipes the index. It needs to respect it!
                }
                else {
                    // This group doesn't match the predicate.
                    return replicate(0, group.count())
                        .withIndex(group.getIndex())
                        .toPairs() //TODO: selectMany wipes the index. It needs to respect it!
                }
            })
            .withIndex(pair => pair[0])
            .select(pair => pair[1]) as any as ISeries<IndexT, number>
    }

    cumsum(): ISeries<IndexT, number> {
        return new Series<IndexT, number>(() => {
            let working = 0
            const pairs: any[][] = this.toPairs()
            const output: any = pairs.map(([index, value]) => ([index, working += value]))
            return { pairs: output }
        })
    }

    defaultIfEmpty(defaultSequence: ValueT[] | ISeries<IndexT, ValueT>): ISeries<IndexT, ValueT> {
        if (this.none()) {
            if (defaultSequence instanceof Series) {
                return <ISeries<IndexT, ValueT>> defaultSequence
            }
            else if (isArray(defaultSequence)) {
                return new Series<IndexT, ValueT>(defaultSequence)
            }
            else {
                throw new Error('Expected \'defaultSequence\' parameter to \'Series.defaultIfEmpty\' to be an array or a series.')
            }
        } 
        else {
            return this
        }
    }

    detectTypes(): IDataFrame<number, ITypeFrequency> {
        return new DataFrame<number, ITypeFrequency>(() => {
            const totalValues = this.count()

            const typeFrequencies = this.select(value => {
                let valueType: string = typeof (value)
                if (valueType === 'object') {
                    if (isDate(value)) {
                        valueType = 'date'
                    }
                }
                return valueType
            })
                .aggregate({}, (accumulated: any, valueType: string) => {
                    let typeInfo = accumulated[valueType]
                    if (!typeInfo) {
                        typeInfo = {
                            count: 0
                        }
                        accumulated[valueType] = typeInfo
                    }
                    ++typeInfo.count
                    return accumulated
                })

            return {
                columnNames: ['type', 'frequency'],
                rows: Object.keys(typeFrequencies)
                    .map(valueType => {
                        return [
                            valueType,
                            (typeFrequencies[valueType].count / totalValues) * 100
                        ]
                    })
            }
        })
    }

    detectValues(): IDataFrame<number, IValueFrequency> {
        return new DataFrame<number, IValueFrequency>(() => {
            const totalValues = this.count()
            const valueFrequencies = this.aggregate(new Map<any, any>(), (accumulated: Map<any, any>, value: any) => {
                let valueInfo = accumulated.get(value)
                if (!valueInfo) {
                    valueInfo = {
                        count: 0,
                        value: value,
                    }
                    accumulated.set(value, valueInfo)
                }
                ++valueInfo.count
                return accumulated
            })

            return {
                columnNames: ['value', 'frequency'],
                rows: Array.from(valueFrequencies.keys())
                    .map(value => {
                        const valueInfo = valueFrequencies.get(value)
                        return [
                            valueInfo.value,
                            (valueInfo.count / totalValues) * 100
                        ]
                    }),
            }
        })
    }

    distinct<ToT>(selector?: SelectorFn<ValueT, ToT>): ISeries<IndexT, ValueT> {
        return new Series<IndexT, ValueT>(() => ({
            values: new DistinctIterable<ValueT, ToT>(this.getContent().values, selector),
            pairs: new DistinctIterable<[IndexT, ValueT],ToT>(this.getContent().pairs, (pair: [IndexT, ValueT]): ToT => selector && selector(pair[1]) || <ToT> <any> pair[1])
        }))
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

    except<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerSelector?: SelectorFn<ValueT, KeyT>,
        innerSelector?: SelectorFn<InnerValueT, KeyT>): 
            ISeries<IndexT, ValueT> {

        if (outerSelector) {
            if (!isFunction(outerSelector)) throw new Error('Expected optional \'outerSelector\' parameter to \'Series.except\' to be a function.')
        }
        else {
            outerSelector = value => <KeyT> <any> value
        }

        if (innerSelector) {
            if (!isFunction(innerSelector)) throw new Error('Expected optional \'innerSelector\' parameter to \'Series.except\' to be a function.')
        }
        else {
            innerSelector = value => <KeyT> <any> value
        }

        const outer = this
        return outer.where(outerValue => {
                const outerKey = outerSelector!(outerValue)
                return inner
                    .where(innerValue => outerKey === innerSelector!(innerValue))
                    .none()
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
                throw new Error('Called Series.parseInts, expected all values in the series to be strings, instead found a \'' + typeof (value) + '\' at index ' + valueIndex)
            }

            if (value.length === 0) {
                return undefined
            }

            return parseInt(value)
        }
    }

    parseInts(): ISeries<IndexT, number> {
        return <ISeries<IndexT, number>>this.select(Series.parseInt)
    }

    static parseFloat(value: any | undefined | null, valueIndex: number): number | undefined {
        if (value === undefined || value === null) {
            return undefined
        }
        else {
            if (!isString(value)) throw new Error('Called Series.parseFloats, expected all values in the series to be strings, instead found a \'' + typeof (value) + '\' at index ' + valueIndex)

            if (value.length === 0) {
                return undefined
            }

            return parseFloat(value)
        }
    }

    parseFloats(): ISeries<IndexT, number> {
        return <ISeries<IndexT, number>>this.select(Series.parseFloat)
    }

    static parseDate(value: any | undefined | null, valueIndex: number, formatString?: string): Date | undefined {
        if (value === undefined || value === null) {
            return undefined
        }
        else {
            if (!isString(value)) throw new Error('Called Series.parseDates, expected all values in the series to be strings, instead found a \'' + typeof (value) + '\' at index ' + valueIndex)

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

        return <ISeries<IndexT, Date>>this.select((value: any | undefined, valueIndex: number) => Series.parseDate(value, valueIndex, formatString))
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

    toString(): string {
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

    toStrings(formatString?: string): ISeries<IndexT, string> {
        if (formatString) {
            if (!isString(formatString)) throw new Error('Expected optional \'formatString\' parameter to Series.toStrings to be a string (if specified).')
        }

        return <ISeries<IndexT, string>>this.select(value => Series.toString(value, formatString))
    }

    truncateStrings(maxLength: number): ISeries<IndexT, ValueT> {
        if (!isNumber(maxLength)) {
            throw new Error('Expected \'maxLength\' parameter to \'Series.truncateStrings\' to be a number.')
        }

        return this.select((value: any) => {
            if (isString(value)) {
                if (value.length > maxLength) {
                    return value.substring(0, maxLength)
                }
            }

            return value
        })
    }

    union<KeyT = ValueT>(
        other: ISeries<IndexT, ValueT>, 
        selector?: SelectorFn<ValueT, KeyT>): 
            ISeries<IndexT, ValueT> {

        if (selector) {
            if (!isFunction(selector)) throw new Error('Expected optional \'selector\' parameter to \'Series.union\' to be a selector function.')
        }

        return this.concat(other).distinct(selector)
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
        if (!isFunction(keySelector)) throw new Error('Expected \'keySelector\' parameter to Series.toObject to be a function.')
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

    cast<NewValueT>(): ISeries<IndexT, NewValueT> {
        return this as any as ISeries<IndexT, NewValueT>
    }

    static concat<IndexT = any, ValueT = any>(series: ISeries<IndexT, ValueT>[]): ISeries<IndexT, ValueT> {
        if (!isArray(series)) throw new Error('Expected \'series\' parameter to \'Series.concat\' to be an array of series.')

        return new Series(() => {
            const upcast = <Series<IndexT, ValueT>[]>series // Upcast so that we can access private index, values and pairs.
            const contents = upcast.map(s => s.getContent())
            return {
                values: new ConcatIterable(contents.map(content => content.values)),
                pairs: new ConcatIterable(contents.map(content => content.pairs)),
            }
        })
    }

    concat(...series: (ISeries<IndexT, ValueT>[] | ISeries<IndexT, ValueT>)[]): ISeries<IndexT, ValueT> {
        const concatInput: ISeries<IndexT, ValueT>[] = [this]

        for (const input of series) {
            if (isArray(input)) {
                for (const subInput of input) {
                    concatInput.push(subInput)
                }
            }
            else {
                concatInput.push(input)
            }
        }

        return Series.concat<IndexT, ValueT>(concatInput)
    }

    print() {
        console.log(this + '')
    }

    getIndex(): IIndex<IndexT> {
        return new Index<IndexT>(() => ({
            values: this.getContent().index
        }))
    }

    groupBy<GroupT>(selector: SelectorWithIndexFn<ValueT, GroupT>): ISeries<number, ISeries<IndexT, ValueT>> {
        if (!isFunction(selector)) throw new Error('Expected \'selector\' parameter to \'Series.groupBy\' to be a selector function that determines the value to group the series by.')

        return new Series<number, ISeries<IndexT, ValueT>>(() => {
            const groups: any[] = [] // Each group, in order of discovery.
            const groupMap: any = {} // Group map, records groups by key.

            let valueIndex = 0

            for (const pair of this.getContent().pairs) {
                const groupKey = selector(pair[1], valueIndex)
                ++valueIndex
                const existingGroup = groupMap[groupKey]
                if (existingGroup) {
                    existingGroup.push(pair)
                }
                else {
                    const newGroup: any[] = []
                    newGroup.push(pair)
                    groups.push(newGroup)
                    groupMap[groupKey] = newGroup
                }
            }

            return {
                values: groups.map(group => new Series<IndexT, ValueT>({ pairs: group }))
            }
        })
    }

    groupSequentialBy<GroupT>(selector?: SelectorFn<ValueT, GroupT>): ISeries<number, ISeries<IndexT, ValueT>> {
        if (selector) {
            if (!isFunction(selector)) throw new Error('Expected \'selector\' parameter to \'Series.groupSequentialBy\' to be a selector function that determines the value to group the series by.')
        }
        else {
            selector = value => <GroupT><any>value
        }

        return this.variableWindow((a: ValueT, b: ValueT): boolean => selector!(a) === selector!(b))
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

    static range<IndexT = any>(series: ISeries<IndexT, number>): number {
        return series.range()
    }

    range(): number {
        return this.max() - this.min()
    }

    resetIndex(): ISeries<number, ValueT> {
        return new Series<number, ValueT>(() => ({
            values: this.getContent().values // Just strip the index.
        }))
    }

    reverse(): ISeries<IndexT, ValueT> {
        return new Series<IndexT, ValueT>(() => ({
            values: new ReverseIterable(this.getContent().values),
            index: new ReverseIterable(this.getContent().index),
            pairs: new ReverseIterable(this.getContent().pairs)
        }))
    }

    rollingWindow(period: number, whichIndex?: WhichIndex): ISeries<IndexT, ISeries<IndexT, ValueT>> {
        if (!isNumber(period)) throw new Error('Expected \'period\' parameter to \'Series.rollingWindow\' to be a number.')

        return new Series<IndexT, ISeries<IndexT, ValueT>>(() => ({
            pairs: new SeriesRollingWindowIterable<IndexT, ValueT>(this.getContent().pairs, period, whichIndex || WhichIndex.End)
        }))
    }

    round(numDecimalPlaces?: number): ISeries<IndexT, ValueT> {
        if (numDecimalPlaces !== undefined) {
            if (!isNumber(numDecimalPlaces)) {
                throw new Error('Expected \'numDecimalPlaces\' parameter to \'Series.round\' to be a number.')
            }
        } else {
            numDecimalPlaces = 2 // Default to two decimal places.
        }

        return this.select((value: any) => {
            if (isNumber(value)) {
                return parseFloat(value.toFixed(numDecimalPlaces))
            }

            return value
        })
    }

    static variance<IndexT = any>(series: ISeries<IndexT, number>): number {
        return series.variance()
    }

    variance(): number {

        if (this.none()) {
            return 0
        }

        const average = this.mean()
        let count = 0
        let sumOfSquaredDiffs = 0
        const numberSeries = <ISeries<IndexT, number>><any>this.where(value => value !== null && value !== undefined)

        for (const value of numberSeries) {
            count += 1
            const numberValue = value as any as number
            const diffFromMean = numberValue - average // Assume input series are numbers.
            const diffFromMeanSqr = diffFromMean * diffFromMean
            sumOfSquaredDiffs += diffFromMeanSqr
        }

        return sumOfSquaredDiffs / count
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
            selector = (value: ValueT): ToT => <ToT><any>value
        }
        return this.variableWindow((a, b) => selector!(a) === selector!(b))
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

    skipWhile(predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT> {
        if (!isFunction(predicate)) throw new Error('Expected \'predicate\' parameter to \'Series.skipWhile\' function to be a predicate function that returns true/false.')

        return new Series<IndexT, ValueT>(() => ({
            values: new SkipWhileIterable(this.getContent().values, predicate),
            pairs: new SkipWhileIterable(this.getContent().pairs, pair => predicate(pair[1])),
        }))
    }

    skipUntil(predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT> {
        if (!isFunction(predicate)) throw new Error('Expected \'predicate\' parameter to \'Series.skipUntil\' function to be a predicate function that returns true/false.')

        return this.skipWhile(value => !predicate(value))
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

    static std<IndexT = any>(series: ISeries<IndexT, number>): number {
        return series.std()
    }

    std(): number {
        if (this.none()) {
            return 0
        }

        return Math.sqrt(this.variance())
    }

    static sum<IndexT = any>(series: ISeries<IndexT, number>): number {
        return series.sum()
    }

    sum(): number {
        let total = 0

        for (const value of this) {
            if (value === null || value === undefined) {
                continue // Skip empty values.
            }

            total += value as any as number // Assumes this is a number series.
        }

        return total
    }

    take(numRows: number): ISeries<IndexT, ValueT> {
        if (!isNumber(numRows)) throw new Error('Expected \'numRows\' parameter to \'Series.take\' function to be a number.')

        return new Series<IndexT, ValueT>(() => ({
            index: new TakeIterable(this.getContent().index, numRows),
            values: new TakeIterable(this.getContent().values, numRows),
            pairs: new TakeIterable(this.getContent().pairs, numRows),
        }))
    }

    takeWhile(predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT> {
        if (!isFunction(predicate)) throw new Error('Expected \'predicate\' parameter to \'Series.takeWhile\' function to be a predicate function that returns true/false.')

        return new Series(() => ({
            values: new TakeWhileIterable(this.getContent().values, predicate),
            pairs: new TakeWhileIterable(this.getContent().pairs, pair => predicate(pair[1]))
        }))
    }

    takeUntil(predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT> {
        if (!isFunction(predicate)) throw new Error('Expected \'predicate\' parameter to \'Series.takeUntil\' function to be a predicate function that returns true/false.')

        return this.takeWhile(value => !predicate(value))
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

    private _getRowByIndex(index: IndexT): ValueT | undefined {
        if (!this.indexedContent) {
            this.indexedContent = new Map<any, ValueT>()
            for (const pair of this.getContent().pairs) {
                this.indexedContent.set(pair[0], pair[1])
            }
        }

        return this.indexedContent.get(index)
    }

    at(index: IndexT): ValueT | undefined {
        if (this.none()) {
            return undefined
        }

        return this._getRowByIndex(index)
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
            return this.skip(1).aggregate(<ToT><any>this.first(), seedOrSelector)
        } else {
            if (!isFunction(selector)) throw new Error('Expected \'selector\' parameter to aggregate to be a function.')

            let accum = <ToT>seedOrSelector

            for (const value of this) {
                accum = selector!(accum, value)
            }

            return accum
        }
    }

    appendPair(pair: [IndexT, ValueT]): ISeries<IndexT, ValueT> {
        if (!isArray(pair)) throw new Error('Expected \'pair\' parameter to \'Series.appendPair\' to be an array.')
        if (pair.length !== 2) throw new Error('Expected \'pair\' parameter to \'Series.appendPair\' to be an array with two elements. The first element is the index, the second is the value.')

        return this.concat(new Series<IndexT, ValueT>({ pairs: [pair] }))
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
        return (<ISeries<IndexT, number>><any>this) // Have to assume this is a number series.
            .rollingWindow(period, whichIndex)
            .select(window => window.max() - window.min())
    }

    proportionRange(period: number, whichIndex?: WhichIndex): ISeries<IndexT, number> {
        return (<ISeries<IndexT, number>><any>this) // Have to assume this is a number series.
            .rollingWindow(period, whichIndex)
            .select(window => (window.max() - window.min()) / window.last())
    }

    percentRank(period?: number): ISeries<IndexT, number> {
        if (period === undefined) {
            period = 2
        }

        if (!isNumber(period)) {
            throw new Error('Expected \'period\' parameter to \'Series.percentRank\' to be a number that specifies the time period for the ranking.')
        }

        return this.proportionRank(period).select(proportion => proportion * 100)
    }

    percentRange(period: number, whichIndex?: WhichIndex): ISeries<IndexT, number> {
        return this.proportionRange(period, whichIndex).select(v => v * 100)
    }

    amountChange(period?: number, whichIndex?: WhichIndex): ISeries<IndexT, number> {
        return (<ISeries<IndexT, number>><any>this) // Have to assume this is a number series.
            .rollingWindow(period === undefined ? 2 : period, whichIndex)
            .select(window => window.last() - window.first())
    }

    proportionChange(period?: number, whichIndex?: WhichIndex): ISeries<IndexT, number> {
        return (<ISeries<IndexT, number>><any>this) // Have to assume this is a number series.
            .rollingWindow(period === undefined ? 2 : period, whichIndex)
            .select(window => (window.last() - window.first()) / window.first())
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

        return this.rollingWindow(period + 1) // +1 to account for the last value being used.
            .select(window => {
                const latestValue = window.last()
                const numLowerValues = window.head(-1).where(prevMomentum => prevMomentum < latestValue).count()
                const proportionRank = numLowerValues / period!
                return proportionRank
            })
    }

    static zip<IndexT = any, ValueT = any, ResultT = any>(series: Iterable<ISeries<IndexT, ValueT>>, zipper: ZipNFn<ValueT, ResultT>): ISeries<IndexT, ResultT> {
        const input = Array.from(series)

        if (input.length === 0) {
            return new Series<IndexT, ResultT>()
        }

        const firstSeries = input[0]
        if (firstSeries.none()) {
            return new Series<IndexT, ResultT>()
        }

        return new Series<IndexT, ResultT>(() => {
            const firstSeriesUpCast = <Series<IndexT, ValueT>>firstSeries
            const upcast = <Series<IndexT, ValueT>[]>input // Upcast so that we can access private index, values and pairs.

            return {
                index: <Iterable<IndexT>>firstSeriesUpCast.getContent().index,
                values: new ZipIterable<ValueT, ResultT>(upcast.map(s => s.getContent().values), zipper),
            }
        })
    }

    zip<Index2T, Value2T, ResultT>(s2: ISeries<Index2T, Value2T>, zipper: Zip2Fn<ValueT, Value2T, ResultT>): ISeries<IndexT, ResultT>;
    zip<Index2T, Value2T, Index3T, Value3T, ResultT>(s2: ISeries<Index2T, Value2T>, s3: ISeries<Index3T, Value3T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT>): ISeries<IndexT, ResultT>;
    zip<Index2T, Value2T, Index3T, Value3T, Index4T, Value4T, ResultT>(s2: ISeries<Index2T, Value2T>, s3: ISeries<Index3T, Value3T>, s4: ISeries<Index4T, Value4T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT>): ISeries<IndexT, ResultT>;
    zip<ResultT>(...args: any[]): ISeries<IndexT, ResultT> {
        const selector: Function = args[args.length - 1]
        const input: ISeries<IndexT, any>[] = [this].concat(args.slice(0, args.length - 1))
        return Series.zip<IndexT, any, ResultT>(input, values => selector(...values))
    }
}

class OrderedSeries<IndexT = number, ValueT = any, SortT = any>
    extends Series<IndexT, ValueT>
    implements IOrderedSeries<IndexT, ValueT, SortT> {

    //
    // Configuration for the ordered series.
    //
    config: IOrderedSeriesConfig<IndexT, ValueT, SortT>;

    //
    // Helper function to create a sort spec.
    //
    private static _makeSortSpec(sortLevel: number, selector: SortSelectorFn, direction: Direction): ISortSpec {
        return { sortLevel: sortLevel, selector: selector, direction: direction }
    }

    //
    // Helper function to make a sort selector for pairs, this captures the parent correct when generating the closure.
    //
    private static _makePairsSelector(selector: SortSelectorFn): SortSelectorFn {
        return (pair: any, index: number) => selector(pair[1], index)
    }

    constructor(config: IOrderedSeriesConfig<IndexT, ValueT, SortT>) {

        const valueSortSpecs: ISortSpec[] = []
        const pairSortSpecs: ISortSpec[] = []
        let sortLevel = 0

        let parent = config.parent as OrderedSeries<IndexT, ValueT, SortT>
        const parents: OrderedSeries<IndexT, ValueT, SortT>[] = []

        while (parent !== null) {
            parents.push(parent)
            parent = parent.config.parent as OrderedSeries<IndexT, ValueT, SortT>
        }

        parents.reverse()

        for (const p of parents) {
            const parentConfig = p.config
            valueSortSpecs.push(OrderedSeries._makeSortSpec(sortLevel, parentConfig.selector, parentConfig.direction))
            pairSortSpecs.push(OrderedSeries._makeSortSpec(sortLevel, OrderedSeries._makePairsSelector(parentConfig.selector), parentConfig.direction))
            ++sortLevel
        }

        valueSortSpecs.push(OrderedSeries._makeSortSpec(sortLevel, config.selector, config.direction))
        pairSortSpecs.push(OrderedSeries._makeSortSpec(sortLevel, OrderedSeries._makePairsSelector(config.selector), config.direction))

        super({
            values: new OrderedIterable(config.values, valueSortSpecs),
            pairs: new OrderedIterable(config.pairs, pairSortSpecs)
        })

        this.config = config
    }

    /** 
     * Applys additional sorting (ascending) to an already sorted series.
     * 
     * @param selector User-defined selector that selects the additional value to sort by.
     * 
     * @return Returns a new series has been additionally sorted by the value chosen by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * // Order sales by salesperson and then by amount (from least to most).
     * const ordered = sales.orderBy(sale => sale.SalesPerson).thenBy(sale => sale.Amount);
     * </pre>
     */
    thenBy(selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT> {
        return new OrderedSeries<IndexT, ValueT, SortT>({
            values: this.config.values,
            pairs: this.config.pairs,
            selector: selector,
            direction: Direction.Ascending,
            parent: this,
        })
    }

    /** 
     * Applys additional sorting (descending) to an already sorted series.
     * 
     * @param selector User-defined selector that selects the additional value to sort by.
     * 
     * @return Returns a new series has been additionally sorted by the value chosen by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * // Order sales by salesperson and then by amount (from most to least).
     * const ordered = sales.orderBy(sale => sale.SalesPerson).thenByDescending(sale => sale.Amount);
     * </pre>
     */
    thenByDescending(selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT> {
        return new OrderedSeries<IndexT, ValueT, SortT>({
            values: this.config.values,
            pairs: this.config.pairs,
            selector: selector,
            direction: Direction.Descending,
            parent: this
        })
    }
}

export class Index<IndexT> extends Series<number, IndexT> implements IIndex<IndexT> {
    private _type?: string

    constructor(config?: any | SeriesConfigFn<number, IndexT>) {
        super(config)
    }

    getType(): string {
        if (!this._type) {
            if (this.any()) {
                this._type = determineType(this.first())
            } else {
                this._type = 'empty'
            }
        }
        return this._type
    }

    getLessThan(): IIndexPredicateFn {
        switch (this.getType()) {
            case 'date':
                return (d1: Date, d2: Date) => moment(d1).isBefore(d2)

            case 'string':
            case 'number':
                return (v1: any, v2: any) => v1 < v2

            case 'empty':
                return () => true // Series is empty, so this makes no difference.

            default:
                throw new Error('No less than operation available for type: ' + this.getType())
        }
    }

    getLessThanOrEqualTo(): IIndexPredicateFn {
        return (v1: any, v2: any) => !this.getGreaterThan()(v1, v2) //TODO: Should expand  this out.
    }

    getGreaterThan(): IIndexPredicateFn {
        switch (this.getType()) {
            case 'date':
                return (d1: Date, d2: Date) => moment(d1).isAfter(d2)

            case 'string':
            case 'number':
                return (v1: any, v2: any) => v1 > v2

            case 'empty':
                return () => true // Series is empty, so this makes no difference.

            default:
                throw new Error('No greater than operation available for type: ' + this.getType())
        }
    }
}