import { Observable } from 'rxjs'
import { CandleQuoteDto } from '../Models/CandleQuoteDto'
import { CandleStickDTO } from '../Models/CandleStickDto'
import { ResolutionType } from '../Models/ResolutionType'

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
