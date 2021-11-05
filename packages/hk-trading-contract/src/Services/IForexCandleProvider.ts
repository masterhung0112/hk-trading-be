import { ISeries } from 'hk-pd'
import { CandleStickDTO } from '../Models/CandleStickDto'
import { ResolutionType } from '../Models/ResolutionType'

export interface IForexCandleProvider {
    getCandlesAfter(pair: string, timeframe: ResolutionType, afterTs: number, candleCount: number): ISeries<CandleStickDTO>
    getCandlesBefore(pair: string, timeframe: ResolutionType, beforeTs: number, candleCount: number): ISeries<CandleStickDTO>
}