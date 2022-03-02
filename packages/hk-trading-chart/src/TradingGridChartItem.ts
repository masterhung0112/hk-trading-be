import { ChartType, DefaultDataPoint, ITradingChartItem, ITradingSubplotDataset, ITradingChartHookCallbacksType, TimeRange, ITradingChart, TimeRangeChanged } from 'hk-trading-contract'

export class TradingGridChartItem<TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>> implements ITradingChartItem<TType, TData> {
    dataStartIndex: number
    dataEndIndex: number

    constructor(protected subplotData: ITradingSubplotDataset<TType, TData>[]) {

    }

    // loading?: boolean
    get hooks(): ITradingChartHookCallbacksType {
        return {
            draw: this.render.bind(this),
            rangeChanged: this.rangeChanged.bind(this)
        }
    }

    get data(): ITradingSubplotDataset<TType, TData>[] {
        return this.subplotData
    }

    protected drawGrid() {
        //
        
    }

    protected getDatasetMeta(datasetIndex: string) {
        let meta = this.datasetMetaMap.get(datasetIndex)
        if (!meta) {
            meta = {
                index: datasetIndex,
                data: {
                    mainchart: null,
                    onchart: [],
                    offchart: [],
                },
                controller: null
            }
            this.datasetMetaMap.set(datasetIndex, meta)
        }

        return meta
    }

    protected getSortedDatasetMetas(filterVisible) {
        const metasets = this.sortedMetasets
        const result = []
        let i, ilen
    
        for (i = 0, ilen = metasets.length; i < ilen; ++i) {
          const meta = metasets[i]
          if (!filterVisible || meta.visible) {
            result.push(meta)
          }
        }
    
        return result
      }

    protected drawDataset() {
        //
    }

    protected drawDatasets() {
        const metasets = this.getSortedVisibleDatasetMetas()
        for (let i = metasets.length - 1; i >= 0; --i) {
          this.drawDataset(metasets[i])
        }
    }

    update(mode?: string) {
        // config.update()

        // update scale
        // plugins.invalidate()

        // this.buildOrUpdateControllers()

        // updateLayout

        
        this.render()
    }

    render() {
        // notify 'beforeRender'

        // Draw grid
        this.drawGrid()

        // for each overlay, call draw hook
    }

    rangeChanged(chart: ITradingChart, args: [TimeRangeChanged]) {
        const range = args[0]
        if (!range.indexOhlvc) {
            throw new Error('require indexOhlcv in rangeChanged')
        }
        this.dataStartIndex = range.indexOhlvc[0]
        this.dataEndIndex = range.indexOhlvc[1]
    }
}