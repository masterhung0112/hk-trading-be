import { ISeries } from 'hk-pd'
import { CandleStickDTO, IForexCandleProvider, ResolutionType } from 'hk-trading-contract'

export class ForexCandleProvider implements IForexCandleProvider {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getCandlesAfter(pair: string, timeframe: ResolutionType, afterTs: number, candleCount: number): ISeries<CandleStickDTO, any> {
        throw new Error('Method not implemented.')
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getCandlesBefore(pair: string, timeframe: ResolutionType, beforeTs: number, candleCount: number): ISeries<CandleStickDTO, any> {
        throw new Error('Method not implemented.')
    }

}