import { CandleQuoteDto } from '../Models'

export interface ICandleQuoteWriteStore {
    saveTick(candle: CandleQuoteDto): Promise<void>
    saveManyTicks(candles: CandleQuoteDto[]): Promise<void>
}