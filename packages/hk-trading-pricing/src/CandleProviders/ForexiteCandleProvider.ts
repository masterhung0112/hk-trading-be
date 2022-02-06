import { CandleStickDTO, GetOhlcvOptions, ICandleStickProvider, ICandlesReadStore, SymbolInfo } from 'hk-trading-contract'

/**
 * Download data from: https://forextester.com/data/datasources
 */
export class ForexiteCandleProvider implements ICandleStickProvider {
    constructor(protected candleReadStore: ICandlesReadStore) {
        
    }

    getSymbols(): SymbolInfo[] {
        return [{
            exchange: 'forexite',
            id: 'Forexite:XAUUSD',
            supportedResolutions: ['1m'],
            name: 'XAU/USD',
            hasIntraday: true,
            volumePrecision: 2,
            hasNoVolume: false,
            description: 'XAUUSD from Forexite',
            pricescale: 3,
            timezone: 'UTC',
            session: '',
            type: 'commodity'
        }]
    }

    async getOhlcvBeforeTime(options: GetOhlcvOptions): Promise<CandleStickDTO[]> {
        return this.candleReadStore.getCandles({
            resolutionType: options.resolution,
            symbolId: options.symbolId,
            toTime: options.ts
        })
    }

    async getOhlcvAfterTime(options: GetOhlcvOptions): Promise<CandleStickDTO[]> {
        return this.candleReadStore.getCandles({
            resolutionType: options.resolution,
            symbolId: options.symbolId,
            fromTime: options.ts
        })
    }
}