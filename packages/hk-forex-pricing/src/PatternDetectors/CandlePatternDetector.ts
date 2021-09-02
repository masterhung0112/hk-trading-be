import { from, mergeMap, Observable, map,  Subject, of, combineLatestWith } from 'rxjs'
import { CandleMultiStickDto, CandleStickDTO, IForexCandlesReadStore, PatternRecognitionDto } from 'hk-trading-contract'
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
            // const candleAndFinderSubject = new Subject<{ finder: ICandlestickFinder, candles: CandleMultiStickDto }>()

            // this.supportedCandlePatternFinders.forEach(async (finder) => {
            //   await this.forexCandlesStore.getCandles({
            //     resolutionType: candleStickDto.resolutionType,
            //     toTime: candleStickDto.sts,
            //     num: finder.requiredCount
            //   })
            // })

            return from(this.supportedCandlePatternFinders.map((finder) => {
              // await this.forexCandlesStore.getCandles({
              //   resolutionType: candleStickDto.resolutionType,
              //   toTime: candleStickDto.sts,
              //   num: finder.requiredCount
              // })
              return of(finder).pipe(
                combineLatestWith(from(this.forexCandlesStore.getCandles({
                  resolutionType: candleStickDto.resolutionType,
                  toTime: candleStickDto.sts,
                  num: finder.requiredCount
                }))
              ))
              // return {finder: finder, candles: )}
            }))
          }),
          mergeMap(a => a)
        )
      }, 10),
    )

    return stream$.pipe(
      map(([finder, candles]) => {
        if (candles.bc.length < finder.requiredCount) {
          // Not enough candles for pattern detection
          return null
        } else if (finder.hasPattern(candles)) {
          // Found this is the pattern that we need
          return {
            patternSymbol: finder.name,
            patternDisplayName: finder.name,
            resolutionType: candles.resolutionType,
            symbol: candles.sym,
          } as PatternRecognitionDto
        }
        return null
      })
    )

    // We run each finder for each stream
    // return forkJoin([stream, from(this.supportedCandlePatternFinders)]).pipe(
    //   mergeMap(([a, b]) => {
    //       // Read the necessary candles from database
    //       return from(this.forexCandlesStore.getCandles({
    //         resolutionType: a.resolutionType,
    //         toTime: a.sticks.sts,
    //         num: b.requiredCount
    //       })).pipe(
    //         // We received the number of candles requested, detect if it's the pattern we need
    //         map((multiStickEntity => {
    //           if (multiStickEntity.bc.length < b.requiredCount) {
    //             // Not enough candles for pattern detection
    //             return null
    //           } else if (b.hasPattern(multiStickEntity)) {
    //               // Found this is the pattern that we need
    //               return {
    //                 patternSymbol: b.name,
    //                 patternDisplayName: b.name,
    //                 resolutionType: a.resolutionType,
    //                 symbol: a.sticks.sym,
    //               } as PatternRecognitionDto
    //           }
    //           return null
    //         }))
    //       )
    //   })
    // )


    // zip(candle, from(this.supportedCandlePatternFinders)).pipe(
    //   tap(([candle, finder]) => {
    //     finder.hasPattern(candle)
    //   })
    // )
    //   mergeMap((stream) => {
    //     combineLatest([stream, of(this.forexCandlesStore.getCandles({
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
