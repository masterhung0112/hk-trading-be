// This entity can be partition by day, by hour
export interface CandleStickDTO {
    sym: string // Symbol
    sts: number // Start Timestamp
    ets?: number // End Timestamp
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

export interface CandleStickBidAskDTO extends CandleStickDTO {
    ao: number
    ah: number
    al: number
    ac: number
}
