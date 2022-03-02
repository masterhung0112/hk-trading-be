import { CandleStickDTO } from '../Models'

export interface ICandlesWriteStore {
    saveCandle(candle: CandleStickDTO): Promise<void>
    saveManyCandles(candles: CandleStickDTO[]): Promise<void>
}