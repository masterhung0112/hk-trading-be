import { ITradingChartDataProvider } from "hk-trading-contract"
import { TradingViewWidget } from "../src/TradingViewWidget"
import { mock } from 'jest-mock-extended'

describe('TradingViewWidget', () => {
    it('onReady was called', () => {
        const dataFeedMock = mock<ITradingChartDataProvider>()
        const tradingView = new TradingViewWidget({
            containerId: '',
            datafeed: dataFeedMock,
        })
    })
})