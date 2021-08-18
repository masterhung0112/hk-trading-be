import { CurrencyPair } from "./CurrencyPair";

export interface IPriceGenerator {
    get CurrencyPair(): CurrencyPair
    get EffectiveDate(): Number
    get SourceName(): string
    get SampleRate(): number
}