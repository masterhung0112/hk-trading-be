import { CandleStickDTO, GetOhlcvOptions, ICandleStickProvider, SymbolInfo } from 'hk-trading-contract'
import { CandleProviderDashboard } from '../../src/CandleProviders/CandleProviderDashboard'
import { Mock, It } from 'moq.ts'

describe('CandleProviderDashboard', () => {
    const symbol1: SymbolInfo = {
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
    }

    const symbol2: SymbolInfo = {
        id: 'b',
        description: 'description',
        exchange: 'exchange1',
        hasIntraday: true,
        hasNoVolume: false,
        name: 'B Test',
        pricescale: 100,
        timezone: '+7',
        supportedResolutions: ['1m'],
        volumePrecision: 2,
        session: '',
        type: ''
    }

    const symbolList: SymbolInfo[] = [symbol1]
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
    // const ohlcv1: CandleStickDTO = {
    //     bc: 4,
    //     bh: 2, 
    //     bl: 3, 
    //     bo: 4,
    //     resolutionType: '1m',
    //     sts: new Date(),
    //     sym: 'a',
    // }

    it('create empty list of symbol and empty list of candle provider', async () => {
        const dashboard = new CandleProviderDashboard([])
        expect(dashboard.getSymbols()).toEqual([])

        try {
            await dashboard.getCandlesAfter({
                resolution: '1m',
                symbolId: 'a'
            })
        } catch (e) {
            expect(e.message).toMatch('No support for symbol')
        }
    })

    it('candle provider has symbol list', () => {
        const candleStickProviderMock = new Mock<ICandleStickProvider>()
            .setup(instance => instance.getSymbols())
            .returns(symbolList)

            .setup(instance => instance.getOhlcvAfterTime(It.Is<GetOhlcvOptions>(v => v.resolution === getOhlcvOptions.resolution && v.symbolId === getOhlcvOptions.symbolId)))
            .returns(Promise.resolve([{...ohlcv}]))

        const dashboard = new CandleProviderDashboard([candleStickProviderMock.object()])
        expect(dashboard.getSymbols()).toEqual([...symbolList])

        expect(dashboard.getCandlesAfter({...getOhlcvOptions})).resolves.toEqual([ohlcv])
    })

    it('duplicate symbol from provider throw exception', () => {
        const candleStickProviderMock1 = new Mock<ICandleStickProvider>()
        .setup(instance => instance.getSymbols())
        .returns(symbolList)

        const candleStickProviderMock2 = new Mock<ICandleStickProvider>()
        .setup(instance => instance.getSymbols())
        .returns(symbolList)

        expect(() => new CandleProviderDashboard([candleStickProviderMock1.object(), candleStickProviderMock2.object()])).toThrowError()

        /**
         * Won't throw when there's no overlap of Symbol
         */
        const candleStickProviderMock3 = new Mock<ICandleStickProvider>()
        .setup(instance => instance.getSymbols())
        .returns([symbol2])
        
        expect(() => new CandleProviderDashboard([candleStickProviderMock1.object(), candleStickProviderMock3.object()])).not.toThrowError()
    })
})