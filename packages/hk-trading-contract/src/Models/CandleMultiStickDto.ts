import { ResolutionType } from './ResolutionType'

export interface CandleMultiStickDto {
    sym: string // Symbol
    resolutionType: ResolutionType
    sts: number[] // Start Timestamp
    ets?: number[] // End timestamp
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