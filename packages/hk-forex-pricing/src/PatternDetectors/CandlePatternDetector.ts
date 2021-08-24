import { Observable } from 'rxjs'
import { MarketData } from '../constracts/MarketData'

export class CandlePatternDetector {
    // Retrieve new bar. Try to process
    getOutputStream(observable$: Observable<MarketData>) {
        observable$.pipe(
            /*
                Loop each registered pattern
                Retrieve the required minimum of candles, combined with the last candle stick
                Detect if the pattern is detected
                    - If detected, fire the event
                    - If with new candlestick, the old detection result change, then notify it
                    - If not found, ignore it
            */
        )
    }
}