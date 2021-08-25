import { ForexTickData } from '../Entities'

export interface IForexQuoteStore {
    GetTicks(options: {
        symbol: string
        fromTime: number, 
        toTime?: number,
        limit?: number
    }): Promise<ForexTickData[]>

    saveTick(candle: ForexTickData): Promise<void>
    saveManyTicks(candles: ForexTickData[]): Promise<void>
}