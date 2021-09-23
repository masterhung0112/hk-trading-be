/**
 * A user-defined selector function with no index. 
 * Transforms a value into another kind of value.
 */
export type SelectorFn<FromT, ToT> = (value: FromT) => ToT