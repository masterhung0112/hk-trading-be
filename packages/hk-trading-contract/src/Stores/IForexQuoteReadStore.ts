import { CandleQuoteDto } from '../Models'

export interface IForexQuoteReadStore {
    GetTicks(options: {
        symbol: string
        fromTime: number, 
        toTime?: number,
        limit?: number
    }): Promise<CandleQuoteDto[]>
}