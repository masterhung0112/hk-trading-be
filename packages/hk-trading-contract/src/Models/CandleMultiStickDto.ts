import { ResolutionType } from './ResolutionType'

export interface CandleMultiStickDto {
    sym: string // Symbol
    resolutionType: ResolutionType
    firstStickSts: number //
    lastStickSts: number // UTC timestamp
    sts: number[] // Start UTC Timestamp
    ets?: number[] // End UTC timestamp
    bo: number[] // Bid Open
    bh: number[] // Bid High
    bl: number[] // Bid Low
    bc: number[] // Bid Close
    v?: number[] // Volume
}

export interface CandleMultiStickBidAskDto extends CandleMultiStickDto {
    ao: number[]
    ah: number[]
    al: number[]
    ac: number[]
}