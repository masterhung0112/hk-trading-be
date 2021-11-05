/**
 * A selector function with no index. Transforms a value into another kind of value.
 */
export type SelectorFnNoIndex<FromT, ToT> = (value: FromT) => ToT