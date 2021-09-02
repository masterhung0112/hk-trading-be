import { CandleMultiStickDto } from 'hk-trading-contract'

export interface CandleMultiStickReversedDto extends CandleMultiStickDto {
    reversedInput?: boolean
}