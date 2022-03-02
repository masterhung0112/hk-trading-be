import { from, mergeMap, Observable, map,  of, combineLatestWith } from 'rxjs'
import { CandleStickDTO, ICandlesReadStore, PatternRecognitionDto } from 'hk-trading-contract'
import { ICandlestickFinder } from 'hk-technical-indicators'

export class CandlePatternDetector {
  constructor(
    protected supportedCandlePatternFinders: ICandlestickFinder[],
    protected forexCandlesStore: ICandlesReadStore
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
                  fromTime: new Date(candleStickDto.sts.getUTCMilliseconds() - (finder.requiredBarNum * 60 * 1.9 * 1000)),
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
        const bcCount = candles.length
        if (bcCount > 0) {
          if (bcCount < finder.requiredBarNum) {
            // Not enough candles for pattern detection
            return null
          } else if (finder.hasPattern(candles)) {
            // Found this is the pattern that we need
            return {
              patternSymbol: finder.id,
              patternDisplayName: finder.name,
              resolutionType: candles[0].resolutionType,
              sts: candles[0].sts,
              symbol: candles[0].sym,
              // firstStickSts: candles.firstStickSts,
              // lastStickSts: candles.lastStickSts
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
