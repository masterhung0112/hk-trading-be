/**
 * Defines a record in the frequency table output by the `Series.frequency` function.
 */
 export interface IFrequencyTableEntry {

    /**
     * Lower value in this group of the frequency table.
     */
    lower?: number;

    /** 
     * Upper value in this group of the frequency table.  
     */
    upper?: number;

    /**
     * Count of values in this group.
     */
    count: number;

    /**
     * Proportion (0-1) of values in this group.
     */
    proportion: number;

    /**
     * Cumulative proportion of values in this and earlier groups.
     */
    cumulative: number;

    /**
     * The values that were record in this group.
     * (if enabled in the options).
     */
    values?: number[];
}