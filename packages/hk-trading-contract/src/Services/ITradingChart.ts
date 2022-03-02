import { CandleStickDTO } from '../Models/CandleStickDto'
import { ResolutionType } from '../Models/ResolutionType'
import { SymbolInfo } from '../Models/SymbolInfo'
import { TimeRangeChanged } from '../Models/TimeRange'
import { ChartType, DefaultDataPoint, ITradingSubplotDataset, IChartSubplotData, ITradingSubplot } from '../Models/TradingChartData'
import { DeepPartial } from '../Utils/DeepPartial'

export type ITradingChartHookCallback = (chart: ITradingChart, args: any[]) => void
export type RangeChangedCallback = (chart: ITradingChart, args: [TimeRangeChanged]) => void

export interface ITradingChartHook {
    init: {
        callbackType: () => void
    }
    destroy: {
        callbackType: () => void
    }
    draw: {
        callbackType: () => void
    }
    setSize: {
        callbackType: () => void
    }
    setData: {
        callbackType: () => void
    }
    drawClear: {
        callbackType: () => void
    }
    ready: {
        callbackType: () => void
    }
    setSelect: {
        callbackType: () => void
    }
    setSeries: {
        callbackType: () => void
    }
    setLegend: {
        callbackType: () => void
    }
    setCursor: {
        callbackType: () => void
    }
    syncRect: {
        callbackType: () => void
    }
    rangeChanged: {
        callbackType: RangeChangedCallback
    }
}

export type ITradingChartHookType = keyof ITradingChartHook

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

export type ITradingChartHookCallbacksType = DeepPartial<{ [key in ITradingChartHookType]: ITradingChartHook[key]['callbackType'] }>

export interface ITradingChartItem<TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>> {
    readonly data: ITradingSubplotDataset<TType, TData>[]
    loading?: boolean | null
    hooks: ITradingChartHookCallbacksType
}

export interface GetBarsReply {
    data: number[][]
    isLast?: boolean
}

export interface ITradingChartDataProvider<TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>> {
    // This is the first method of the datafeed that is called
    onReady(): Promise<TradingChartConfig>

    // setData(target: string, newData: IDataFrame<number, any>)

    // get historical data for the symbol when chart scroll
    // When periodParams.firstDataRequest == true, this is time to load the first data
    getBars(
        symbolInfo: string,
        resolution: ResolutionType,
        periodParams: TradingChartPeriodParams,
    ): Promise<GetBarsReply>

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

    addSubplot(nrows: number, ncols: number, index: number, chartSubplotData: IChartSubplotData<TType, TData>): ITradingSubplot<TType, TData>
    subplot(index: number): ITradingSubplot<TType, TData>
}

export interface ITradingChart<TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>> {
    // add(side: 'onchart' | 'offchart', chartItem: ITradingSubplotDataset<TType, TData>): string
    // readonly data: ITradingSubplotDataset<TType, TData>

    // Show/hide all overlays
    // showOverlay(overlayId: string)
    // hideOverlay(overlayId: string)

    update(mode?: string)
}

export interface ITradingChartPluginService {
    notify<TType extends ChartType, TData>(chart: ITradingChart<TType, TData>, hook: ITradingChartHookType, ...args)
    allPlugins(): ITradingChartItem
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