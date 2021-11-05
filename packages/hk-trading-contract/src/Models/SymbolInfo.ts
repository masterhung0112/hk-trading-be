import { ResolutionType } from './ResolutionType'

export interface SymbolInfo {
    ticket: string,
    name: string,
    description: string,
    type: string,
    session: string, // 24x7
    timezone: string, // Etc/UTC
    exchange: string,
    pricescale: number // 100
    hasIntraday: boolean
    hasNoVolume: boolean
    supportedResolutions: ResolutionType[]
    volumePrecision: number // 2
    dataStatus: string // 'streaming'
}