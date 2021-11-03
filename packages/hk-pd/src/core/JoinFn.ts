/**
 * A user-defined function that joins two values and produces a result.
 */
export type JoinFn<ValueT1, ValueT2, ResultT> = (a: ValueT1, b: ValueT2) => ResultT