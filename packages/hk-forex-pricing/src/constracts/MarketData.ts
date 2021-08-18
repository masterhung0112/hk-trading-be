import { CurrencyPair } from "./CurrencyPair"

export class MarketData {
    _currencyPair: CurrencyPair
    _sampleRate: number
    _date: number
    _source: string

    constructor(currencyPair: CurrencyPair, sampleRate: number, date: number, source: string) {
        this._currencyPair = currencyPair
        this._sampleRate = sampleRate
        this._date = date
        this._source = source
    }

    get CurrencyPair() {
        return this._currencyPair
    }

    get SampleRate() {
        return this._sampleRate
    }

    get Date() {
        return this._date
    }

    get Source() {
        return this._source
    }

    ToString() {
        return `${this._currencyPair.Symbol} | ${this._sampleRate} | ${this._date} | ${this._source}`
    }
}