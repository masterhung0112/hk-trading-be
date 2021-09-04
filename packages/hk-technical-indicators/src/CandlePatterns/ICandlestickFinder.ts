import { CandleMultiStickReversedDto } from '../Models/CandleMultiStickReversedDto'

export interface ICandlestickFinder {
  get name(): string
  get id(): string
  get requiredBarNum(): number
  hasPattern(data: CandleMultiStickReversedDto): boolean
}