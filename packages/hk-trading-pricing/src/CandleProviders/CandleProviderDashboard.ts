import { CandleStickDTO, GetOhlcvOptions, ICandleStickProvider, ICandleProviderDashboard, isGetOhlcvOptionsValid, SymbolInfo } from 'hk-trading-contract'
import { isArray } from 'hk-utils'

/*
*
*/
export class CandleProviderDashboard implements ICandleProviderDashboard {
    protected supportedSymbols: SymbolInfo[]
    protected exchangePriceProviderMap: Map<string, ICandleStickProvider>

    constructor(exchangePriceProviders: ICandleStickProvider[]) {
        if (!isArray(exchangePriceProviders)) {
            throw new Error('exchangePriceProviders must be an array')
        }
        this.exchangePriceProviderMap = new Map<string, ICandleStickProvider>()
        this.supportedSymbols = []

        exchangePriceProviders.forEach((priceProvider) => {
            const symbols = priceProvider.getSymbols()
            if (isArray(symbols)) {
                symbols.forEach((symbol) => {
                    if (this.exchangePriceProviderMap.has(symbol.id)) {
                        throw new Error(`Duplicate candle stick provider for symbol ${symbol.id}`)
                    }
                    this.exchangePriceProviderMap.set(symbol.id, priceProvider)
                })
                this.supportedSymbols.push(...symbols)
            }
        })
    }

    protected getSymbolById(symbolId: string) {
        return this.supportedSymbols.find((s) => s.id === symbolId)
    }

    protected getDataProviderForSymbol(symbolId: string) {
        return this.exchangePriceProviderMap.get(symbolId)
    }

    getSymbols(): SymbolInfo[] {
        return this.supportedSymbols
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getCandlesAfter(options: GetOhlcvOptions): Promise<CandleStickDTO[]> {
        const e = isGetOhlcvOptionsValid(options)
        if (e != null) {
            throw e
        }
        const foundSymbol = this.getSymbolById(options.symbolId)
        if (!foundSymbol) {
            throw new Error(`No support for symbol ${options.symbolId}`)
        }

        const exchangeDataProvider = this.getDataProviderForSymbol(options.symbolId)
        if (!exchangeDataProvider) {
            throw new Error(`No data provider of exchange ${foundSymbol.exchange} for symbol ${options.symbolId}`)
        }

        return exchangeDataProvider.getOhlcvAfterTime(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getCandlesBefore(options: GetOhlcvOptions): Promise<CandleStickDTO[]> {
        const e = isGetOhlcvOptionsValid(options)
        if (e != null) {
            throw e
        }
        const foundSymbol = this.getSymbolById(options.symbolId)
        if (!foundSymbol) {
            return []
        }

        const exchangeDataProvider = this.getDataProviderForSymbol(options.symbolId)
        if (!exchangeDataProvider) {
            throw new Error(`No data provider of exchange ${foundSymbol.exchange} for symbol ${options.symbolId}`)
        }

        return exchangeDataProvider.getOhlcvBeforeTime(options)
    }
}
