import { ISeries } from './ISeries'

export type ZipNFn<ValueT, ReturnT> = (input: ISeries<number, ValueT>) => ReturnT;
export type Zip2Fn<T1, T2, ReturnT> = (a: T1, b : T2) => ReturnT;
export type Zip3Fn<T1, T2, T3, ReturnT> = (a: T1, b: T2, c: T3) => ReturnT;
export type Zip4Fn<T1, T2, T3, T4, ReturnT> = (a: T1, b: T2, c: T3, d: T4) => ReturnT;
export type Zip5Fn<T1, T2, T3, T4, T5, ReturnT> = (a: T1, b: T2, c: T3, d: T4, e: T5) => ReturnT;