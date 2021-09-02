import { CandleMultiStickDto } from '../Models'
import { ResolutionType } from '../Models/ResolutionType'

export interface IForexCandlesReadStore {
    getCandles(options: {
        resolutionType: ResolutionType
        fromTime?: Date
        toTime?: Date
        num?: number
    }): Promise<CandleMultiStickDto>
}
