/**
 * Represents the frequency of a value in a series or dataframe.
 */
 export interface IValueFrequency {

    /**
     * Name of the column containing the value.
     */
    column: string;

    /**
     * The value.
     */
    value: any; 

    /**
     * The frequency of the value's appearance in the series or dataframe.
     */
    frequency: number;
}