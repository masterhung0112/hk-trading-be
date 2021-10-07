export type AggregateFn<ValueT, ToT> = (accum: ToT, value: ValueT) => ToT