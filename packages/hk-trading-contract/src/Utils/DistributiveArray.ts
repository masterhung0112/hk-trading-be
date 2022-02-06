export type DistributiveArray<T> = [T] extends [unknown] ? Array<T> : never
