import { ResolutionType } from './ResolutionType'

export interface PatternRecognitionDto {
    patternSymbol: string
    patternDisplayName: string
    resolutionType: ResolutionType
    sts: Date
    symbol: string
}