import { SelectorWithIndexFn } from './SelectorWithIndexFn'

/**
 * Specifies columns to transform and the user-defined selector function that does the transformation.
 */
 export interface IColumnTransformSpec {
    [columnName: string]: SelectorWithIndexFn<any, any>
}