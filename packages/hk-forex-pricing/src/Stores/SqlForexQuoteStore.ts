import { ForexTickData, IForexQuoteStore } from 'hk-trading-contract'
import { MySQLTable, PoolPlus } from 'mysql-plus'

export class SqlForexQuoteStore implements IForexQuoteStore {
    private forexQuoteTable: MySQLTable
    constructor(private _poolPlus: PoolPlus) {
        this.forexQuoteTable = new MySQLTable('forex_quote', {}, this._poolPlus)

    }

  async GetTicks(options: { symbol: string; fromTime: number; toTime?: number; limit?: number }): Promise<ForexTickData[]> {
    throw new Error('Method not implemented.')
  }

    async init() {
        await this._poolPlus.pquery(`
        CREATE TABLE IF NOT EXISTS forex_quote(
            symbol VARCHAR(32),
            start TIMESTAMP(3),
            bid DECIMAL(16, 6),
            ask DECIMAL(16, 6),
            PRIMARY KEY (symbol, start)
        )`)
    }


    async saveTick(candle: ForexTickData) {
        await this.forexQuoteTable.insert(
            {symbol: candle.symbol, start: new Date(candle.start), bid: candle.bid, ask: candle.ask}
        )
    }

    async saveManyTicks(candles: ForexTickData[]) {
        candles.forEach(async (tick) => {
            await this.forexQuoteTable.insert(
                [['symbol', 'start', 'bid', 'ask'],
                [tick.symbol, tick.start, tick.bid, tick.ask]]
            )
        })
    }

}
