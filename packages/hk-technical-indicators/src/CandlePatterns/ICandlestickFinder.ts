import { CandleStickDTO } from 'hk-trading-contract'

export interface ICandlestickFinder {
  get name(): string
  get id(): string
  get requiredBarNum(): number
  hasPattern(data: CandleStickDTO[]): boolean
}