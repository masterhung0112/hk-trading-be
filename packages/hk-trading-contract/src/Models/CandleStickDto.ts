// This entity can be partition by day, by hour
export type CandleStickDTO = {
    sym: string // Symbol
    sts: number // Start Timestamp
    ets?: number // End timestamp
    bo: number // Bid Open
    bh: number // Bid High
    bl: number // Bid Low
    bc: number // Bid Close
    // ao: number
    // ah: number
    // al: number
    // ac: number
    v?: number // Volume
}

export type CandleStickBidAskDTO = CandleStickDTO & {
    ao: number
    ah: number
    al: number
    ac: number
}

export type QuoteEntity = {
    symbol: string
    ts: number
    bid: number
    ask: number
}