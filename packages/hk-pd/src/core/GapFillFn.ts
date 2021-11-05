/*
 * A user-defined gap-filler function.
 * This function generates a sequence of values between to fill the gaps between two other values.
 */
export type GapFillFn<ValueT, ResultT> = (a: ValueT, b: ValueT) => ResultT[]