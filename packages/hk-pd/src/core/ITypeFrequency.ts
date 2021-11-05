/**
 * Represents the frequency of a type in a series or dataframe.
 */
 export interface ITypeFrequency {

    /**
     * Name of the column containing the value.
     */
    column: string;

    /**
     * The name of the type.
     */
    type: string; 

    /**
     * The frequency of the type's appearance in the series or dataframe.
     */
    frequency: number;
}