import { ForexTickData, IForexQuoteStore } from "hk-trading-contract"
import { Connection } from "mysql"

export class SqlForexQuoteStore implements IForexQuoteStore {
    constructor(private _mysqlConnection: Connection) {

    }

    private initializeSchema() {
        this._mysqlConnection.query(`
        CREATE TABLE forex_quote(
            
        )`)
    }

    GetTicks(options: { symbol: string; fromTime: number; toTime?: number; limit?: number; }): ForexTickData[] {
        throw new Error("Method not implemented.")
    }
    saveTick(candle: ForexTickData) {
        throw new Error("Method not implemented.")
    }
    saveManyTicks(candles: ForexTickData[]) {
        throw new Error("Method not implemented.")
    }

}