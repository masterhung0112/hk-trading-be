import { Observable } from 'rxjs'
import { CandleStickDTO, CandleQuoteDto, ResolutionType } from 'hk-trading-contract'

export interface IMarketDataAdapter {
  // get RequestUriString(): string
  // get marketDataObservable(): Observable<MarketData[]>

  createQuote(symbol: string): Observable<CandleQuoteDto>

  createCandlesStream(
    symbol: string,
    resolution: ResolutionType,
    option: { fromTimestamp?: Date; toTimestamp?: Date, num?: number }
  ): Observable<CandleStickDTO[]>
}
