import { CandleStickDTO, GetOhlcvOptions, ICandleStickProvider, SymbolInfo } from 'hk-trading-contract'
import { CandleProviderDashboard } from '../../src/CandleProviders/CandleProviderDashboard'
import { Mock, It } from 'moq.ts'

describe('CandleProviderDashboard', () => {
    it('create empty list of symbol and empty list of candle provider', () => {
        const dashboard = new CandleProviderDashboard([])
        expect(dashboard.getSymbols()).toEqual([])
        expect(() => dashboard.getCandlesAfter({
            resolution: '1m',
            symbolId: 'a'
        })).toThrowError()
    })

    it('candle provider has symbol list', () => {
        const symbolList: SymbolInfo[] = [{
            id: 'a',
            description: 'description',
            exchange: 'exchange1',
            hasIntraday: true,
            hasNoVolume: false,
            name: 'A Test',
            pricescale: 100,
            timezone: '+7',
            supportedResolutions: ['1m'],
            volumePrecision: 2,
            session: '',
            type: ''
        }]
        const getOhlcvOptions: GetOhlcvOptions = {
            resolution: '1m',
            symbolId: 'a'
        }
        const ohlcv: CandleStickDTO = {
            bc: 1,
            bh: 2, 
            bl: 3, 
            bo: 4,
            resolutionType: '1m',
            sts: new Date(),
            sym: 'a',
        }
        const candleStickProviderMock = new Mock<ICandleStickProvider>()
            .setup(instance => instance.getSymbols())
            .returns(symbolList)

            .setup(instance => instance.getOhlcvAfterTime(It.Is<GetOhlcvOptions>(v => v.resolution === getOhlcvOptions.resolution && v.symbolId === getOhlcvOptions.symbolId)))
            .returns([{...ohlcv}])

        const dashboard = new CandleProviderDashboard([candleStickProviderMock.object()])
        expect(dashboard.getSymbols()).toEqual([...symbolList])

        expect(dashboard.getCandlesAfter({...getOhlcvOptions})).toEqual([ohlcv])
    })
})