import { ForexTickData } from "../Entities"

export interface IForexQuoteStore {
    GetTicks(options: {
        symbol: string
        fromTime: number, 
        toTime?: number,
        limit?: number
    }): ForexTickData[]

    saveTick(candle: ForexTickData)
    saveManyTicks(candles: ForexTickData[])
}