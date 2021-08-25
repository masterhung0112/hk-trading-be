import { Observable } from 'rxjs'
import { CandleStickDTO, ForexTickData, ResolutionType } from 'hk-trading-contract'

export interface IMarketDataAdapter {
  // get RequestUriString(): string
  // get marketDataObservable(): Observable<MarketData[]>

  createQuote(symbol: string): Observable<ForexTickData>

  createCandlesStream(
    symbol: string,
    resolution: ResolutionType,
    option: { fromTimestamp?: Date; toTimestamp?: Date, num?: number }
  ): Observable<CandleStickDTO[]>
}
