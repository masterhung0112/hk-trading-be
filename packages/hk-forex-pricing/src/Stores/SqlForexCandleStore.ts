import { ForexCandleEntity, IForexCandlesStore, ResolutionType } from "hk-trading-contract"

export class SqlForexCandleStore implements IForexCandlesStore {
    getCandles(options: { resolutionType: ResolutionType; fromTime: number; toTime: number; }): ForexCandleEntity[] {
        throw new Error("Method not implemented.")
    }
    saveCandle(candle: ForexCandleEntity) {
        throw new Error("Method not implemented.")
    }
    saveManyCandles(candles: ForexCandleEntity[]) {
        throw new Error("Method not implemented.")
    }

}