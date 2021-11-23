import { CandleQuoteDto, GetCandleTicksOption, ICandleQuoteReadStore, ICandleQuoteWriteStore } from 'hk-trading-contract'
import { dateToMysqlFormat, MySQLTable, PoolPlus } from 'mysql-plus'

export class SqlForexQuoteStore implements ICandleQuoteReadStore, ICandleQuoteWriteStore {
  private forexQuoteTable: MySQLTable
  constructor(private _poolPlus: PoolPlus) {
    this.forexQuoteTable = new MySQLTable('forex_quote', {}, this._poolPlus)

  }

  async init() {
    return await this._poolPlus.pquery(`
        CREATE TABLE IF NOT EXISTS forex_quote(
            symbol VARCHAR(32) NOT NULL,
            start TIMESTAMP(3) NOT NULL,
            bid DECIMAL(16, 6) NOT NULL,
            ask DECIMAL(16, 6) NOT NULL,
            PRIMARY KEY (symbol, start)
        )`)
  }

  async saveTick(candle: CandleQuoteDto) {
    await this.forexQuoteTable.insert(
      { symbol: candle.sym, start: dateToMysqlFormat(new Date(candle.sts)), bid: candle.b, ask: candle.a }
    )
  }

  async saveManyTicks(candles: CandleQuoteDto[]) {
    candles.forEach(async (tick) => {
      await this.forexQuoteTable.insert(
        [['symbol', 'start', 'bid', 'ask'],
        [tick.sym, tick.sts, tick.b, tick.a]]
      )
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  GetTicks(options: GetCandleTicksOption): Promise<CandleQuoteDto[]> {
    throw new Error('Method not implemented.')
  }
}
