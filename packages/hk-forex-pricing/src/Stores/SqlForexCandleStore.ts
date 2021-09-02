import { IForexCandlesReadStore, CandleStickDTO, CandleMultiStickDto, ResolutionType } from 'hk-trading-contract'
import { MySQLTable, PoolPlus } from 'mysql-plus'

function twoDigits(d) {
  if (0 <= d && d < 10) return '0' + d.toString()
  if (-10 < d && d < 0) return '-0' + (-1 * d).toString()
  return d.toString()
}


function toMysqlFormat(d: Date) {
  if (!d) return ''
  return d.getUTCFullYear() + '-' + twoDigits(1 + d.getUTCMonth()) + '-' + twoDigits(d.getUTCDate()) + ' ' + twoDigits(d.getUTCHours()) + ':' + twoDigits(d.getUTCMinutes()) + ':' + twoDigits(d.getUTCSeconds())
}

export class SqlForexCandleStore implements IForexCandlesReadStore {
  private forexCandleTable: MySQLTable
  private forexQuoteTable: MySQLTable

  constructor(private _poolPlus: PoolPlus) {
    this.forexCandleTable = new MySQLTable('forex_candlesticks', {}, this._poolPlus)
    this.forexQuoteTable = new MySQLTable('forex_quote', {}, this._poolPlus)

  }

  async init() {
    // return await this._poolPlus.pquery(`
    //     CREATE TABLE IF NOT EXISTS forex_candlesticks(
    //         sym VARCHAR(32) NOT NULL,
    //         sts TIMESTAMP(3) NOT NULL,
    //         ets TIMESTAMP(3),
    //         bo DECIMAL(16, 6) NOT NULL,
    //         bh DECIMAL(16, 6) NOT NULL,
    //         bl DECIMAL(16, 6) NOT NULL,
    //         bc DECIMAL(16, 6) NOT NULL,
    //         ao DECIMAL(16, 6),
    //         ah DECIMAL(16, 6),
    //         al DECIMAL(16, 6),
    //         ac DECIMAL(16, 6),
    //         v DECIMAL(20, 4),
    //         PRIMARY KEY (sym, sts)

    //     )`)
  }

  async saveCandle(candle: CandleStickDTO) {
    await this.forexCandleTable.insert(
      candle
    )
  }

  private resolutionTypeToInverval(resolutionType: ResolutionType) {
    switch (resolutionType) {
      case '1d':
        return (24 * 60)
      case '1h':
        return 60
      case '1m':
        return 1
      case '1s':
        throw new Error(`unsupported resolution Type ${resolutionType}`)
      case '1w':
        return (7 * 24 * 60)
      case '4h':
        return (4 * 60)
      case '5m':
      default:
        throw new Error(`unsupported resolution Type ${resolutionType}`)
    }
  }

  getCandles(options: { resolutionType: ResolutionType; symbol: string; fromTime?: Date; toTime?: Date; num?: number }): Promise<CandleMultiStickDto> {
    const fromTime = toMysqlFormat(options.fromTime)
    const toTime = toMysqlFormat(options.toTime)
    const interval = this.resolutionTypeToInverval(options.resolutionType)
    const statement = `
    SELECT m.symbol, q1.bid AS open,
        q2.bid AS close,
        m.low AS low,
        m.high AS high,
        m.open_time
    FROM (SELECT symbol, MIN(start) AS min_time,
        MAX(start) AS max_time,
        MIN(bid) AS low,
        MAX(bid) as high,
        from_unixtime(round(UNIX_TIMESTAMP(start) / (60 * ${interval}))* (60 * ${interval})) AS open_time
    FROM mysqlplustest.forex_quote
    WHERE symbol = "${options.symbol}" ${fromTime ? `AND start >= "${fromTime}"` : ''} ${toTime ? `AND start <= "${toTime}"` : ''}
    GROUP BY symbol, open_time) m
    JOIN mysqlplustest.forex_quote q1 ON m.min_time = q1.start
    JOIN mysqlplustest.forex_quote q2 ON m.max_time = q2.start
    ${options.num ? `LIMIT ${options.num}` : ''}
    `
    return this._poolPlus.pquery(statement)
  }
}
