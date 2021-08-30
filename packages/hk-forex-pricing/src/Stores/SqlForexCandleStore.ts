import { IForexCandlesReadStore, CandleStickDTO, CandleMultiStickDto, ResolutionType } from 'hk-trading-contract'
import { MySQLTable, PoolPlus } from 'mysql-plus'

export class SqlForexCandleStore implements IForexCandlesReadStore {
  private forexCandleTable: MySQLTable
  constructor(private _poolPlus: PoolPlus) {
    this.forexCandleTable = new MySQLTable('forex_candlesticks', {}, this._poolPlus)
  }

  async init() {
    return await this._poolPlus.pquery(`
        CREATE TABLE IF NOT EXISTS forex_candlesticks(
            sym VARCHAR(32) NOT NULL,
            sts TIMESTAMP(3) NOT NULL,
            ets TIMESTAMP(3),
            bo DECIMAL(16, 6) NOT NULL,
            bh DECIMAL(16, 6) NOT NULL,
            bl DECIMAL(16, 6) NOT NULL,
            bc DECIMAL(16, 6) NOT NULL,
            ao DECIMAL(16, 6),
            ah DECIMAL(16, 6),
            al DECIMAL(16, 6),
            ac DECIMAL(16, 6),
            v DECIMAL(20, 4),
            PRIMARY KEY (sym, sts)

        )`)
  }

  async saveCandle(candle: CandleStickDTO) {
    await this.forexCandleTable.insert(
      candle
    )
  }

  getCandles(options: { resolutionType: ResolutionType; fromTime?: number; toTime?: number; num?: number }): Promise<CandleMultiStickDto> {
    throw new Error('Method not implemented.')
  }
}
