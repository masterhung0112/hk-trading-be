/**
 * Options to the `Series.frequency` function.
 */
 export interface IFrequencyTableOptions {

    /**
     * Lower boundary (if defined).
     */
    lower?: number;

    /**
     * Upper boundary (if defined).
     */
    upper?: number;

     /**
     * Directly sets the interval (if defined). This is the range of each group.
     */
    interval?: number;
    
    /**
     * Enables capturing of values for each group.
     */
    captureValues?: boolean;
}