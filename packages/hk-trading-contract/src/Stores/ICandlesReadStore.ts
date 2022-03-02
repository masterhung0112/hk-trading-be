import { CandleStickDTO } from '../Models'
import { ResolutionType } from '../Models/ResolutionType'

export interface GetCandlesOption {
        resolutionType: ResolutionType
        symbolId: string
        fromTime?: Date
        toTime?: Date
        num?: number
}

export interface GetCandleOption {
    resolutionType: ResolutionType
    symbolId: string
    fromTime?: Date
    toTime?: Date
}

export interface ICandlesReadStore {
    getCandles(options: GetCandlesOption): Promise<CandleStickDTO[]>

    getCandle(options: GetCandleOption): Promise<CandleStickDTO | null>
}
