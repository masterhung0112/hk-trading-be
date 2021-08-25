import { CandleStickEntity } from '../Entities/CandleStickEntity'
import { ResolutionType } from '../Models/ResolutionType'

export interface IForexCandlesStore {
    getCandles(options: {
        resolutionType: ResolutionType, 
        fromTime: number, 
        toTime: number
    }): Promise<CandleStickEntity[]>

    saveCandle(candle: CandleStickEntity): Promise<void>
    saveManyCandles(candles: CandleStickEntity[]): Promise<void>
}