import { ResolutionType } from './ResolutionType'

// This entity can be partition by day, by hour
export interface CandleStickDTO {
    sym: string // Symbol
    resolutionType: ResolutionType
    sts: Date // Start Timestamp
    ets?: Date // End Timestamp
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

export function preSaveCandleStickDto(candleStick: CandleStickDTO) {
    if (!candleStick) {
        throw new Error('candleStick cannot be null')
    }

    if (!candleStick.sym) {
        throw new Error('candleStick.sym cannot be null')
    }

    if (!candleStick.resolutionType) {
        throw new Error('candleStick.resolutionType cannot be null')
    }

    if (!candleStick.sts) {
        throw new Error('candleStick.sts cannot be null')
    }

    if (!candleStick.bo) {
        throw new Error('candleStick.bo cannot be null')
    }
}