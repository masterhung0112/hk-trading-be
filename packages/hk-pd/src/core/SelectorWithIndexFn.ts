/**
 * A user-defined selector function. 
 * Transforms a value into another kind of value.
 */
export type SelectorWithIndexFn<FromT, ToT> = (value: FromT, index: number) => ToT