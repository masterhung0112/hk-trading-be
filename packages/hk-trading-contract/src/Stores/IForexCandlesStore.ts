import { ForexCandleEntity } from "../Entities/ForexCandleEntity";
import { ResolutionType } from "../Models/ResolutionType";

export interface IForexCandlesStore {
    getCandles(options: {
        resolutionType: ResolutionType, 
        fromTime: number, 
        toTime: number
    }): ForexCandleEntity[]

    saveCandle(candle: ForexCandleEntity)
    saveManyCandles(candles: ForexCandleEntity[])
}