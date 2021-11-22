import { ISeries, Series } from 'hk-pd'
import { CandleStickDTO, IDataProvider, IForexCandleProvider, ResolutionType, SymbolInfo } from 'hk-trading-contract'

/*
*
*/
export class ForexCandleProvider implements IForexCandleProvider {
    constructor(protected supportedSymbols: SymbolInfo[], protected exchangePriceProvider: Map<string, IDataProvider>) {

    }

    protected getSymbolById(symbolId: string) {
        return this.supportedSymbols.find((s) => s.id === symbolId)
    }

    getSymbols(): SymbolInfo[] {
        return this.supportedSymbols
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getCandlesAfter(symbolId: string, timeframe: ResolutionType, afterTs: number, candleCount: number): ISeries<number, CandleStickDTO> {
        const foundSymbol = this.getSymbolById(symbolId)
        if (!foundSymbol) {
            return new Series<number, CandleStickDTO>([])
        }

        
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getCandlesBefore(symbol: string, timeframe: ResolutionType, beforeTs: number, candleCount: number): ISeries<number, CandleStickDTO> {
        throw new Error('Method not implemented.')
    }

}