import { CandleMultiStickReversedDto } from '../Models/CandleMultiStickReversedDto'

export interface ICandlestickFinder {
  get name(): string
  get requiredCount(): number
  hasPattern(data: CandleMultiStickReversedDto): boolean
}