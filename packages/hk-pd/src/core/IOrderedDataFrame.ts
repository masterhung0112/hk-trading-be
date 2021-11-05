import { IDataFrame } from './IDataFrame'
import { SelectorWithIndexFn } from './SelectorWithIndexFn'

// export type SortSelectorFn = SelectorWithIndexFn<any, number>

export interface IOrderedDataFrame<IndexT = number, ValueT = any, SortT = any> extends IDataFrame<IndexT, ValueT> {

    /** 
     * Applys additional sorting (ascending) to an already sorted dataframe.
     * 
     * @param selector User-defined selector that selects the additional value to sort by.
     * 
     * @return Returns a new dataframe has been additionally sorted by the value chosen by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * // Order sales by salesperson and then by amount (from least to most).
     * const orderedDf = salesDf.orderBy(sale => sale.SalesPerson).thenBy(sale => sale.Amount);
     * </pre>
     */
    thenBy(selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT>;

    /** 
     * Applys additional sorting (descending) to an already sorted dataframe.
     * 
     * @param selector User-defined selector that selects the additional value to sort by.
     * 
     * @return Returns a new dataframe has been additionally sorted by the value chosen by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * // Order sales by salesperson and then by amount (from most to least).
     * const orderedDf = salesDf.orderBy(sale => sale.SalesPerson).thenByDescending(sale => sale.Amount);
     * </pre>
     */
    thenByDescending(selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT>;
}