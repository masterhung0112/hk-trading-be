import {  ITradingChartDataProvider, TradingChartConfig } from 'hk-trading-contract'
import { TradingViewWidget } from '../src/TradingViewWidget'
import { mock, MockProxy } from 'jest-mock-extended'
import waitForExpect from 'wait-for-expect'
import Ohlcv from './data/ohlcv.json'

describe('TradingViewWidget', () => {
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

    let dataFeedMock: MockProxy<ITradingChartDataProvider>

    beforeEach(() => {
        dataFeedMock = mock<ITradingChartDataProvider>()

        document.body.innerHTML = '<div id="testContainerId"></div>'
    })

    it('onReady was called', async () => {     
        dataFeedMock.onReady.mockResolvedValue(tradingChartConfig)
        dataFeedMock.getBars.mockResolvedValue(Ohlcv['ohlcv'])

        const tradingView = new TradingViewWidget({
            containerId: 'testContainerId',
            datafeed: dataFeedMock,
        })

        await waitForExpect(async () => {
            expect(dataFeedMock.onReady).toHaveBeenCalledTimes(1)
            expect(dataFeedMock.getBars).toHaveBeenCalledWith('EURUSD', '5m', {
                from: '',
                to: '',
                firstDataRequest: true,
            })
        }, 1000)
    })
})