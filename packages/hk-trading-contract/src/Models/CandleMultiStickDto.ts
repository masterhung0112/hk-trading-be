import { ISeries } from 'hk-pd'
import { ResolutionType } from './ResolutionType'

export interface CandleMultiStickDto {
    sym: string // Symbol
    resolutionType: ResolutionType
    firstStickSts: number //
    lastStickSts: number // UTC timestamp
    sts: ISeries<number> // Start UTC Timestamp
    ets?: number[] // End UTC timestamp
    bo: ISeries<number> // Bid Open
    bh: ISeries<number> // Bid High
    bl: ISeries<number> // Bid Low
    bc: ISeries<number> // Bid Close
    v?: ISeries<number> // Volume
}

export interface CandleMultiStickBidAskDto extends CandleMultiStickDto {
    ao: ISeries<number>
    ah: ISeries<number>
    al: ISeries<number>
    ac: ISeries<number>
}