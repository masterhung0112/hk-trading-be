/* eslint-disable @typescript-eslint/no-unused-vars */
import { ITradingChartDataProvider, ResolutionType, SymbolInfo, TradingChartConfig, TradingChartPeriodParams } from 'hk-trading-contract'
import Ohlcv from '../../data/ohlcv.json'
import { TradingViewWidget } from '../../dist/hk-trading-chart.esm'

export class SampleTradingChartDataProvider implements ITradingChartDataProvider {
    async onReady(): Promise<TradingChartConfig> {
        const tradingChartConfig: TradingChartConfig = {
            exchanges: [{
                name: 'FXCM',
                value: 'FXCM',
                desc: 'FXCM'
            }],
            indexBased: false,
            supportedResolutions: ['5m'],
            symbolTypes: [{
                name: 'EUR/USD',
                value: 'EURUSD'
            }]
        }
        return tradingChartConfig
    }

    async getBars(symbolInfo: string, resolution: ResolutionType, periodParams: TradingChartPeriodParams): Promise<number[][]> {
        return Ohlcv['ohlcv']
    }
    searchSymbols(userInput: string, exchange: string, symbolType: string): Promise<any[]> {
        throw new Error('Method not implemented.')
    }
    resolveSymbol(symbol: string): Promise<SymbolInfo> {
        throw new Error('Method not implemented.')
    }
}

document.addEventListener('DOMContentLoaded', function (event) {
    const dataFeedMock = new SampleTradingChartDataProvider()

    new TradingViewWidget({
        containerId: 'trading_view_container',
        datafeed: dataFeedMock,
    })
})