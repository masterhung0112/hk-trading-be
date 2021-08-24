import { IForexCandlesStore, ResolutionType } from 'hk-trading-contract'
import { MySQLTable, PoolPlus } from 'mysql-plus'

export class SqlForexCandleStore implements IForexCandlesStore {
    private forexCandleTable: MySQLTable
    constructor(private _poolPlus: PoolPlus) {
        this.forexCandleTable = new MySQLTable('forex_candlesticks', {}, this._poolPlus)
        this._poolPlus.pquery(`
        CREATE TABLE IF NOT EXISTS forex_candlesticks(
            symbol VARCHAR(32) PRIMARY KEY,
            start TIMESTAMP PRIMARY KEY,
            stop TIMESTAMP NULLABLE,
            bid_open DECIMAL,
            bid_high DECIMAL,
            bid_low DECIMAL,
            bid_close DECIMAL,
            ask_open DECIMAL NULLABLE,
            ask_high DECIMAL NULLABLE,
            ask_low DECIMAL NULLABLE,
            ask_close DECIMAL NULLABLE,
            vol DECIMAL,
        )`)
    }

    async getCandles(options: {
        resolutionType: ResolutionType;
        fromTime: number;
        toTime: number;
    }): Promise<CandleStickEntity[]> {
        return []
    }

    async saveCandle(candle: CandleStickEntity) {
        //
    }

    async saveManyCandles(candles: CandleStickEntity[]) {
        //
    }

}