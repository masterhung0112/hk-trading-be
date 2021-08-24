import { CandleStickPatternEventIdType } from './CandleStickPatternEvent.id'

export type CandleStickPatternEvent = {
    evId: string,
    evType: CandleStickPatternEventIdType,
    patternId: string,

    // List of candles generating this pattern
    candles: {
        sym: string // Symbol
        sts: number // Start Timestamp
        ets?: number
    }[]
}