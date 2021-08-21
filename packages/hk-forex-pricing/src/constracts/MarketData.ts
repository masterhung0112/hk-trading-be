import { CurrencyPair } from "./CurrencyPair"

export class MarketData {
    _currencyPair: CurrencyPair
    _bid: number
    _date: number
    _source: string

    constructor(currencyPair: CurrencyPair, bid: number, date: number, source: string) {
        this._currencyPair = currencyPair
        this._bid = bid
        this._date = date
        this._source = source
    }

    get CurrencyPair() {
        return this._currencyPair
    }

    get Bid() {
        return this._bid
    }

    get Date() {
        return this._date
    }

    get Source() {
        return this._source
    }

    ToString() {
        return `${this._currencyPair.Symbol} | ${this._bid} | ${this._date} | ${this._source}`
    }
}