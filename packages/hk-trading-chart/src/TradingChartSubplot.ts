import { ChartType, IChartSubplotData, ITradingSubplot, IChartRegistry, IChartSubplotDataMeta, ITradingChartItem } from 'hk-trading-contract'
import { isArray } from '@hungknow/utils'
import { TradingGridChartItem } from './TradingGridChartItem'

export class TradingChartSubplot<TType extends ChartType, TData> implements ITradingSubplot<TType, TData> {
    protected datasetMetaMap = new Map<string, IChartSubplotDataMeta<TType, TData>>()

    grids: ITradingChartItem<TType, TData>[]
    

    get data(): IChartSubplotData<TType, TData> {
        return this.subplotData
    }

    constructor(protected chartRegistry: IChartRegistry, protected subplotData: IChartSubplotData<TType, TData>) {
        if (!isArray(subplotData.gridDatasets)) {
            throw new Error('gridDatasets must be an array')
        }
        subplotData.gridDatasets.forEach((gridDataset) => {
            this.grids.push(new TradingGridChartItem<TType, TData>(gridDataset))
        })
    }

    protected updateDataset(index: string, mode?: string) {
        const datasetMeta = this.getDatasetMeta(index)
        datasetMeta.controller.update(mode)
    }

    protected updateDatasets(mode?: string) {
        // for(const subplotMeta of this.subplotMetaMap.entries()) {
        //     subplotMeta.controller.configure()
        // }

        // this.data.mainchart.data
        for(const subplotMetaIndex of this.datasetMetaMap.keys()) {
            this.updateDataset(subplotMetaIndex, mode)
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
        // this.drawGrid()

        // for each overlay, call draw hook
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
        
    }

    protected drawDatasets() {
        const metasets = this.getSortedVisibleDatasetMetas()
        for (let i = metasets.length - 1; i >= 0; --i) {
          this.drawDataset(metasets[i])
        }
    }

    protected buildOrUpdateController() {
        for(const datasetData of this.plotData.mainchart) {
            this.chartRegistry.getController(datasetData.type)
        }
    }
    
}