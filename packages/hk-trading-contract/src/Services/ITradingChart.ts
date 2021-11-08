import { IDataFrame, ISeries } from 'hk-pd'
import { CandleStickDTO } from '../Models/CandleStickDto'
import { ResolutionType } from '../Models/ResolutionType'
import { SymbolInfo } from '../Models/SymbolInfo'

export enum ITradingChartHookKeys {
    init = 'init',
    destroy = 'destroy',
    draw = 'draw',
    setSize = 'setSize',
    setData = 'setData',
    drawClear = 'drawClear',
    ready = 'ready',
    setSelect = 'setSelect',
    setSeries = 'setSeries',
    setLegend = 'setLegend',
    setCursor = 'setCursor',
    syncRect = 'syncRect',
    rangeChange = 'rangeChange',
}

export interface ITradingChartOverlayData {
    type: string
    name: string
    data: ISeries<any, any>
    settings: Record<string, string>
}

export interface TradingChartPeriodParams {
    from?: string
    to?: string 
    firstDataRequest?: boolean
}

export interface TradingChartExchangeInfo {
    // `exchange` argument for the `searchSymbols` method, if a user selects this exchange
    value: string // 'Kraken'
    // filter name
    name: string // 'Kraken'
    // full exchange name displayed in the filter popup
    desc: string // 'Kraken bitcoin exchange'
}

export interface TradingChartSymbolType {
    name: string // 'crypto'

    // `symbolType` argument for the `searchSymbols` method, if a user selects this symbol type
    value: string // 'crypto'
}

export interface TradingChartConfig {
    supportedResolutions: ResolutionType[]
    exchanges: TradingChartExchangeInfo[]
    symbolTypes: TradingChartSymbolType[]
    indexBased: boolean
    defaultLen?: number
    minimumLen?: number
}

export type ITradingChartHookCb = (a: {
    ctx: CanvasRenderingContext2D,
    setData(data: any[])
}, args1?: any | null, args2?: any | null) => void

export interface IChartItem {
    name: string // 'RSI, 20', 'EMA, 43'
    type: string // 'EMA', 'RSI'
    data: IDataFrame
    settings: Record<string, string>
    loading?: boolean | null
    hooks: Record<string, ITradingChartHookCb>
}

export interface ITradingChartDataProvider {
    // This is the first method of the datafeed that is called
    onReady(): Promise<TradingChartConfig>

    // setData(target: string, newData: IDataFrame<number, any>)

    // get historical data for the symbol when chart scroll
    // When periodParams.firstDataRequest == true, this is time to load the first data
    getBars(
        symbolInfo: string,
        resolution: ResolutionType,
        periodParams: TradingChartPeriodParams,
    ): Promise<number[][]>

    // search symbols every time a user types a text in the symbol search box.
    // Changing symbols also works using the symbol search.
    searchSymbols(
        userInput: string,
        exchange: string | null | undefined,
        symbolType: string | null | undefined,
    ): Promise<any[]>

    // retrieve information about a specific symbol (exchange, price scale, full symbol etc.).
    resolveSymbol(
        symbol: string
    ): Promise<SymbolInfo>
}

export interface ITradingChart {
    add(side: 'onchart' | 'offchart', chartItem: IChartItem): string

    // Show/hide all overlays
    showOverlay(overlayId: string)
    hideOverlay(overlayId: string)
}

export interface IStepChart {
    /**
     * Step
     */
    startStepSince(sinceTs: number): any;
    stopStep(): any;
    stepNextCandle(): any;
    stepPrevCandle(): any;
    stepCurrentBar(): CandleStickDTO
}