import { DeepPartial } from '../Utils/DeepPartial'
import { DistributiveArray } from '../Utils/DistributiveArray'

export interface ICandleDataPoint {
    sts: number
    o: number
    h: number
    l: number
    c: number
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EmptyDatasetOptions {}

export interface IChartTypeRegistry {
    candle: {
        defaultDataPoint: ICandleDataPoint
        datasetOptions: EmptyDatasetOptions
    },
    ema: {
        defaultDataPoint: [number, number]
        datasetOptions: EmptyDatasetOptions
    }
}

export type DefaultDataPoint<TType extends ChartType> = DistributiveArray<IChartTypeRegistry[TType]['defaultDataPoint']>;

export type ChartType = keyof IChartTypeRegistry

export interface ChartDatasetProperties<TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>> {
    name: string
    type: TType
    data: TData
}

// export interface IDatasetController<
//     TType extends ChartType = ChartType,
//     TElement extends Element = Element,
//     TDatasetElement extends Element = Element,
//     TParsedData = ParsedDataType<TType>> {
//     draw(): void
//     getDataset(): ITradingSubplotDataset
// }

export type ITradingSubplotDataset<
    TType extends ChartType = ChartType,
    TData = DefaultDataPoint<TType>
    > = DeepPartial<{ [key in ChartType]: { type: key } & { settings: IChartTypeRegistry[key]['datasetOptions'] } }[TType]>
    & ChartDatasetProperties<TType, TData>

export interface IChartSubplotData<TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>> {
    gridDatasets: ITradingSubplotDataset<TType, TData>[][]
}

export interface ITradingSubplot<TType extends ChartType, TData> {
    readonly data: IChartSubplotData<TType, TData>
    update(mode?: string)
}

export interface IChartSubplotDataMeta<TType extends ChartType, TData> {
    index: string
    data: IChartSubplotData
    controller: ITradingSubplot<TType, TData>
}

// export interface IChartData {
//     subplotsData: IChartSubplotData
// }

export interface IChartRegistry {
    getController(type: string)
}