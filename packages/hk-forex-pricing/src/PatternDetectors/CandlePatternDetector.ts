import { from, mergeMap, Observable, map,  of, combineLatestWith } from 'rxjs'
import { CandleStickDTO, IForexCandlesReadStore, PatternRecognitionDto } from 'hk-trading-contract'
import { ICandlestickFinder } from 'hk-technical-indicators'

export class CandlePatternDetector {
  constructor(
    protected supportedCandlePatternFinders: ICandlestickFinder[],
    protected forexCandlesStore: IForexCandlesReadStore
  ) {

  }

  // Retrieve new bar. Try to process
  getOutputStream(streams$: Observable<CandleStickDTO>[]): Observable<PatternRecognitionDto | null> {
    /*
      With each stream
        From the candles fetched from stream, take the start timestamp
          If the 'bid' price doesn't change much from the last processed `bid` price, ignore the current candle
          If the difference in price is significant, loop each registered pattern
            Retrieve the required minimum of candles which are closed to the above candle, combined with the last candle stick
              If not enough candles, ignore for now
              If there's enough candles, detect if the pattern is detected
                - If detected, fire the event
                - If with new candlestick, the old detection result change, then notify it
                - If not found, ignore it
    */

    // Iterate streams
    const stream$ = from(streams$).pipe(
      mergeMap((s) => {
        return s.pipe(
          mergeMap((candleStickDto) => {
            return from(this.supportedCandlePatternFinders.map((finder) => {
              return of(finder).pipe(
                combineLatestWith(from(this.forexCandlesStore.getCandles({
                  resolutionType: candleStickDto.resolutionType,
                  symbol: candleStickDto.sym,
                  fromTime: new Date(candleStickDto.sts - (finder.requiredBarNum * 60 * 1.9 * 1000)),
                  toTime: new Date(candleStickDto.sts),
                  num: finder.requiredBarNum
                }))
              ))
            }))
          }),
          mergeMap(a => a)
        )
      }, 10),
    )

    return stream$.pipe(
      map(([finder, candles]) => {
        if (candles.bc.length > 0) {
          if (candles.bc.length < finder.requiredBarNum) {
            // Not enough candles for pattern detection
            return null
          } else if (finder.hasPattern(candles)) {
            // Found this is the pattern that we need
            return {
              patternSymbol: finder.id,
              patternDisplayName: finder.name,
              resolutionType: candles.resolutionType,
              sts: candles.sts[0],
              symbol: candles.sym,
              firstStickSts: candles.firstStickSts,
              lastStickSts: candles.lastStickSts
            } as PatternRecognitionDto
          }
        } else {
          // console.log('no candles')
        }
        return null
      })
    )
  }
}
