import { CandleMultiStickDto, CandleStickDTO } from '../Models'
import { ResolutionType } from '../Models/ResolutionType'

export interface IForexCandlesReadStore {
    getCandles(options: {
        resolutionType: ResolutionType
        symbol: string
        fromTime?: Date
        toTime?: Date
        num?: number
    }): Promise<CandleMultiStickDto>

    getCandle(options: {
        resolutionType: ResolutionType
        symbol: string
        fromTime?: Date
        toTime?: Date
    }): Promise<CandleStickDTO>
}
