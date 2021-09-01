// This entity can be partition by day, by hour
export type CandleStickEntity = {
    sym: string
    sts: Date
    ets?: Date
    bo: number
    bh: number
    bl: number
    bc: number
    ao: number
    ah: number
    al: number
    ac: number
    v: number
}

// export type QuoteEntity = {
//     sym: string
//     sts: number
//     b: number
//     a: number
// }