import { ISeries } from './ISeries'
import { SelectorWithIndexFn } from './SelectorWithIndexFn'

export interface IOrderedSeries<IndexT = number, ValueT = any, SortT = any> extends ISeries<IndexT, ValueT> {

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
    thenBy(selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;

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
    thenByDescending(selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;
}