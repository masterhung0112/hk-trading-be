// This entity can be partition by day, by hour
export type CandleStickEntity = {
    symbol: string
    start: number
    stop: number
    bidOpen: number
    bidHigh: number
    bidLow: number
    bidClose: number
    askOpen: number
    askHigh: number
    askLow: number
    askClose: number
    vol: number
}

export type QuoteEntity = {
    symbol: string
    ts: number
    bid: number
    ask: number
}