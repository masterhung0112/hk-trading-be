import { from, mergeMap, Observable, forkJoin, map } from 'rxjs'
import { CandleStickDTO, IForexCandlesReadStore, PatternRecognitionDto, ResolutionType } from 'hk-trading-contract'
import { ICandlestickFinder } from 'hk-technical-indicators'

export interface CandlePatternStreamInput {
    resolutionType: ResolutionType
    sticks: CandleStickDTO
}

export class CandlePatternDetector {
  constructor(
    protected supportedCandlePatternFinders: ICandlestickFinder[],
    protected forexCandleStore: IForexCandlesReadStore
  ) {

  }

  // Retrieve new bar. Try to process
  getOutputStream(streams$: Observable<CandlePatternStreamInput>[]): Observable<PatternRecognitionDto | null> {
    /*
      With each stream
        Loop each registered pattern
        From the candles fetched from stream, take the start timestamp
          If the 'bid' price doesn't change much from the last processed `bid` price, ignore the current candle
          If the difference in price is significant, retrieve the required minimum of candles which are closed to the above candle, combined with the last candle stick
            If not enough candles, ignore for now
            If there's enough candles, detect if the pattern is detected
              - If detected, fire the event
              - If with new candlestick, the old detection result change, then notify it
              - If not found, ignore it
    */

    // Iterate streams
    const stream = from(streams$).pipe((
      mergeMap((s) => s)
    ))

    // We run each finder for each stream
    return forkJoin([stream, from(this.supportedCandlePatternFinders)]).pipe(
      mergeMap(([a, b]) => {
          // Read the necessary candles from database
          return from(this.forexCandleStore.getCandles({
            resolutionType: a.resolutionType,
            toTime: a.sticks.sts,
            num: b.requiredCount
          })).pipe(
            // We received the number of candles requested, detect if it's the pattern we need
            map((multiStickEntity => {
              if (multiStickEntity.bc.length < b.requiredCount) {
                // Not enough candles for pattern detection
                return null
              } else if (b.hasPattern(multiStickEntity)) {
                  // Found this is the pattern that we need
                  return {
                    patternSymbol: b.name,
                    patternDisplayName: b.name,
                    resolutionType: a.resolutionType,
                    symbol: a.sticks.sym,
                  } as PatternRecognitionDto
              }
              return null
            }))
          )
      })
    )


    // zip(candle, from(this.supportedCandlePatternFinders)).pipe(
    //   tap(([candle, finder]) => {
    //     finder.hasPattern(candle)
    //   })
    // )
    //   mergeMap((stream) => {
    //     combineLatest([stream, of(this.forexCandleStore.getCandles({
    //       resolutionType: '1m',
    //       fromTime: 2,
    //       toTime: candleStick.sts,
    //       num: 2
    //     }))]
    //   })
    // )
    // ).subscribe()



    // return from(this.supportedCandlePatternIds).pipe(
    //   tap(finder => {
    //     finder.hasPattern()
    //   })
    // )


  }
}
