import { CandleStickDTO } from '../Models'

export interface IForexCandlesWriteStore {
    saveCandle(candle: CandleStickDTO): Promise<void>
    saveManyCandles(candles: CandleStickDTO[]): Promise<void>
}