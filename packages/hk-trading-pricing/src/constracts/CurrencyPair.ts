export class CurrencyPair {
    private _baseCcy: string
    private _quoteCcy: string

    constructor(baseCcyOrSymbol: string, quoteCcy?: string) {
        if (!quoteCcy) {
            this._baseCcy = baseCcyOrSymbol.substr(0, 3)
            this._quoteCcy = baseCcyOrSymbol.substr(3, 3)
        } else {
            this._baseCcy = baseCcyOrSymbol
            this._quoteCcy = quoteCcy
        }
    }

    get BaseCcy(): string {
        return this._baseCcy
    }

    get QuoteCcy(): string {
        return this._quoteCcy
    }

    get Symbol(): string {
        return this._baseCcy + this._quoteCcy
    }

    get ReciprocalSymbol(): string {
        return this._quoteCcy + this._baseCcy
    }

    IsReciprocalOf(other: CurrencyPair): boolean {
        return other.Symbol == this.ReciprocalSymbol
    }

    ToString(): string {
        return this.Symbol
    }
}