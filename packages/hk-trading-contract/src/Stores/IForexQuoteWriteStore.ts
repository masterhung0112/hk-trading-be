import { CandleQuoteDto } from '../Models'

export interface IForexQuoteWriteStore {
    saveTick(candle: CandleQuoteDto): Promise<void>
    saveManyTicks(candles: CandleQuoteDto[]): Promise<void>
}