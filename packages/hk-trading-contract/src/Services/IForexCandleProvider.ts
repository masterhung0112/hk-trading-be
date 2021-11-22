import { ISeries } from 'hk-pd'
import { CandleStickDTO } from '../Models/CandleStickDto'
import { ResolutionType } from '../Models/ResolutionType'
import { SymbolInfo } from '../Models/SymbolInfo'

export interface IForexCandleProvider {
    getSymbols(): SymbolInfo[]
    getCandlesAfter(symbol: string, timeframe: ResolutionType, afterTs: number, candleCount: number): ISeries<CandleStickDTO>
    getCandlesBefore(symbol: string, timeframe: ResolutionType, beforeTs: number, candleCount: number): ISeries<CandleStickDTO>
}