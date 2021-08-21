import { Observable } from "rxjs"
import { ResolutionType } from "../../../hk-trading-contract/dist"
import { MarketData } from "./MarketData"

export interface IMarketDataAdapter {
    // get RequestUriString(): string
    // get marketDataObservable(): Observable<MarketData[]>

    createQuote(symbol: string): Observable<MarketData>

    // createCandlesStream(symbol: string, resolution: ResolutionType, option?: {
    //     fromTimestamp?: number
    //     toTimestamp?: number
    // }): Observable<MarketData>
}