import { CandleMultiStickDto } from '../Models'
import { ResolutionType } from '../Models/ResolutionType'

export interface IForexCandlesReadStore {
    getCandles(options: {
        resolutionType: ResolutionType
        fromTime?: number
        toTime?: number
        num?: number
    }): Promise<CandleMultiStickDto>
}
