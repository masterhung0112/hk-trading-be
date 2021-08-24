import { CandleStickEntity } from '../Entities/CandleStickEntity'
import { ResolutionType } from '../Models/ResolutionType'

export interface IForexCandlesStore {
    getCandles(options: {
        resolutionType: ResolutionType, 
        fromTime: number, 
        toTime: number
    }): CandleStickEntity[]

    saveCandle(candle: CandleStickEntity)
    saveManyCandles(candles: CandleStickEntity[])
}