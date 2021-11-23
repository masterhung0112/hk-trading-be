import { ResolutionType } from '../Models'

export interface DeleteCandleOption {
    resolutionType: ResolutionType
    symbolId: string;
    sts: Date
}

export interface DeleteCandlesOption {
    resolutionType: ResolutionType;
    symbolId: string;
    fromTime?: Date;
    toTime?: Date;
}

export interface ICandlesDeleteStore {
    deleteCandle(option: DeleteCandleOption): Promise<void>
    deleteCandles(option: DeleteCandlesOption): Promise<void>
}