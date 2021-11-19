import { createTimeRange, fmtUSD, ITradingChart, ITradingChartDataProvider, ResolutionType, TradingChartConfig, detectIntervalMsFromCandles, IChartItem } from 'hk-trading-contract'
import uPlot from 'uplot'
import { candlestickPlugin } from './ChartPlugins/candlestickPlugin'
import { columnHighlightPlugin } from './ChartPlugins/columnHighlightPlugin'
import { legendAsTooltipPlugin } from './ChartPlugins/legendAsTooltipPlugin'
import { wheelZoomPlugin } from './ChartPlugins/wheelZoomPlugin'
import { TRADINGVIEW_DEFAULT_LEN, TRADINGVIEW_MINIMUM_LEN } from './TradingViewConstants'

export interface TradingViewWidgetConfig {
    // symbol: string
    // resolution: ResolutionType
    containerId: string
    datafeed: ITradingChartDataProvider
    fullscreen?: boolean | null
    autosize?: boolean | null
}

export function validateTradingViewWidgetConfig(config: TradingViewWidgetConfig) {
    if (!config) {
        throw new Error('config cannot be null or undefined')
    }

    if (!config.datafeed) {
        throw new Error('datafeed is required in TradingViewWidgetConfig')
    }
}

export interface PlotInfo {
    containerDomNode?: HTMLElement
    uplot?: uPlot
}

/**
 * Initial flow:
 *  - Caldulate the default time range
 *    + From the data
 */
export class TradingViewWidget implements ITradingChart {
    mainChart: PlotInfo
    onChartMap = new Map<string, PlotInfo>()
    offChartMap = new Map<string, PlotInfo>()
    datafeedConfig?: TradingChartConfig | null
    atomicCount = 0

    currentSymbolInfo?: string
    currentResolution?: ResolutionType
    currentTimeRange = createTimeRange(-Infinity, Infinity)

    ohlcvData: uPlot.AlignedData = [] as any as uPlot.AlignedData //IDataFrame<number, CandleStickDTO> = new DataFrame<number, CandleStickDTO>()

    intervalMs = 0
    interval = 0

    constructor(protected config: TradingViewWidgetConfig) {
        validateTradingViewWidgetConfig(config)
        this.init()
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    add(side: 'onchart' | 'offchart', chartItem: IChartItem): string {
        throw new Error('Method not implemented.')
    }

    createContainerDiv(containerDomNode: HTMLElement, offchartMap: Map<string, PlotInfo>) {
        const mainDiv = document.createElement('div')
        containerDomNode.appendChild(mainDiv)

        this.mainChart = {
            containerDomNode: mainDiv,
        }

        offchartMap.clear()
        for (let i = 0; i < offchartMap.size; ++i) {
            const offchartDiv = document.createElement('div')
            containerDomNode.appendChild(offchartDiv)
            offchartMap.set(`offset${this.atomicCount++}`, {
                containerDomNode: offchartDiv,
            })
        }
    }

    createCharts(opts: {
        containerId: string
    }) {
        const tzDate = ts => uPlot.tzDate(new Date(ts * 1e3), 'Etc/UTC')
        const fmtDate = uPlot.fmtDate('{YYYY}-{MM}-{DD}')

        const containerDomNode = document.getElementById(opts.containerId)
        if (!containerDomNode) {
            throw new Error(`failed to find DOM for ${opts.containerId}`)
        }

        this.createContainerDiv(containerDomNode, this.offChartMap)

        const mainchartOpts: uPlot.Options = {
            width: 1920,
            height: 800,
            title: 'Trading Chart',
            mode: 1,
            tzDate,
            plugins: [
                columnHighlightPlugin(),
                legendAsTooltipPlugin(),
                candlestickPlugin(),
                wheelZoomPlugin(),
            ],
            scales: {
                x: {
                    distr: 2,
                },
                vol: {
                    range: [0, 2000],
                },
            },
            series: [
                {
                    label: 'Date',
                    value: (u, ts) => fmtDate(tzDate(ts)),
                },
                {
                    label: 'Open',
                    value: (u, v) => fmtUSD(v, 2),
                },
                {
                    label: 'High',
                    value: (u, v) => fmtUSD(v, 2),
                },
                {
                    label: 'Low',
                    value: (u, v) => fmtUSD(v, 2),
                },
                {
                    label: 'Close',
                    value: (u, v) => fmtUSD(v, 2),
                },
                {
                    label: 'Volume',
                    scale: 'vol',
                },
            ],
            axes: [
                {},
                {
                    values: (u, vals) => vals.map(v => fmtUSD(v, 0)),
                },
                {
                    side: 1,
                    scale: 'vol',
                    grid: { show: false },
                }
            ]
        }

        // Create uplot for main chart
        if (this.mainChart) {
            this.mainChart = {
                ...this.mainChart,
                uplot: new uPlot(mainchartOpts, undefined, containerDomNode)
            }
        } else {
            throw new Error('failed to create context for main chart')
        }

        // Create uplot for offchart
        for (const offchartEntry of Array.from(this.offChartMap.entries())) {
            if (!offchartEntry[1].containerDomNode) {
                throw new Error(`no container DOM for offset ${offchartEntry[0]}`)
            }

            this.offChartMap.set(offchartEntry[0], {
                ...offchartEntry[1],
                uplot: new uPlot(mainchartOpts, undefined, offchartEntry[1].containerDomNode)
            })
        }
    }

    protected calcInterval() {
        // const tf = Utils.parse_tf(this.forced_tf)
        if (this.ohlcvData.length < 2) {// && !tf) {
            return
        }
        this.intervalMs = detectIntervalMsFromCandles(this.ohlcvData) // tf || detectIntervalMsFromCandles(this.ohlcvData)
        this.interval = this.datafeedConfig.indexBased ? 1 : this.intervalMs
        // Utils.warn(() => this.props.ib && !this.chart.tf, IB_TF_WARN, SECOND)
    }

    // Initialize the time range to display
    protected calculateDefaultTimeRange() {
        const defaultLen = this.datafeedConfig.defaultLen || TRADINGVIEW_DEFAULT_LEN
        const minimumLen = (this.datafeedConfig.minimumLen || TRADINGVIEW_MINIMUM_LEN) + 0.5
        const ohlcvLength = this.ohlcvData.length
        const l = ohlcvLength - 1
        let s = 0
        let d = 0.5

        if (ohlcvLength < 2) {
            return
        }
        // If length of ohlcv array is less than 50, display data from the start
        if (ohlcvLength <= defaultLen) {
            d = minimumLen
        } else {
            // If length of ohlcv array is greater than 50, display data from the last candle
            s = l - defaultLen
            d = 0.5
        }
        if (this.datafeedConfig.indexBased) {
            this.currentTimeRange = createTimeRange(s - this.interval * d, l + this.interval * minimumLen)
        } else {
            this.currentTimeRange = createTimeRange(this.ohlcvData[s][0] - this.interval * d, this.ohlcvData[l][0] + this.interval * minimumLen)
        }
    }

    protected async init() {
        this.datafeedConfig = await this.config.datafeed.onReady()

        this.createCharts({
            containerId: this.config.containerId
        })

        if (!this.currentSymbolInfo && this.datafeedConfig.symbolTypes.length > 0) {
            this.currentSymbolInfo = this.datafeedConfig.symbolTypes[0].value
        }

        if (!this.currentResolution && this.datafeedConfig.supportedResolutions.length > 0) {
            this.currentResolution = this.datafeedConfig.supportedResolutions[0]
        }

        // Fetch the first first data
        if (this.currentSymbolInfo && this.currentResolution) {
            const initialData = await this.config.datafeed.getBars(this.currentSymbolInfo, this.currentResolution, {
                firstDataRequest: true,
                from: '',
                to: '',
            })
            if (initialData) {
                // if (initialData.length > 0) {
                //     if (!Array.isArray(initialData[0])) {
                //         throw new Error(`the element of data in getBars is not of Array type, we got ${typeof initialData[0]}`)
                //     }
                //     if (initialData[0].length !== 5 && initialData[0].length !== 6) {
                //         throw new Error(`The data returned from getBars must have length of 5 or 6, but we got ${initialData[0].length}`)
                //     }
                // }
                // Clone the initial data
                if (Array.isArray(initialData.data)) {
                    this.ohlcvData = initialData.data as any as uPlot.AlignedData //initialData.convertColumnsToArrays(['sts', 'bo', 'bh', 'bl', 'bc', 'v']) as uPlot.AlignedData

                    // this.calcInterval()

                    // Caldulate the default time range from the data
                    // this.calculateDefaultTimeRange()

                    this.mainChart.uplot.setData(this.ohlcvData)
                } else {
                    console.error('data of getBars isn\'t of type array')
                }
            }
        }

        // Performance the first draw
        this.draw()
    }

    draw() {
        // Draw the main chart

        // Draw the onchart

        // Draw the offchart
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    showOverlay(overlayId: string) {
        throw new Error('Method not implemented.')
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hideOverlay(overlayId: string) {
        throw new Error('Method not implemented.')
    }
}
