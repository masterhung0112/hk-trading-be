import { CandleQuoteDto } from '../Models'

export interface GetCandleTicksOption {
    symbolId: string
    fromTime: number, 
    toTime?: number,
    limit?: number
}

export interface ICandleQuoteReadStore {
    GetTicks(options: GetCandleTicksOption): Promise<CandleQuoteDto[]>
}