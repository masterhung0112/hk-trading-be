import { IForexCandlesReadStore, CandleStickDTO, ResolutionType, secondToResolutionType, resolutionTypeToSeconds } from 'hk-trading-contract'
import { dateToMysqlFormat, MySQLTable, PoolPlus } from 'mysql-plus'

export class SqlForexCandleFromQuoteStore implements IForexCandlesReadStore {
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

  async getCandles(options: { resolutionType: ResolutionType; symbol: string; fromTime?: Date; toTime?: Date; num?: number }): Promise<CandleStickDTO[]> {

    if ((!options.fromTime || !options.toTime) && !options.num) {
      throw new Error('fromTime or toTime must be available when options.num is not available')
    }
    const intervalSecond = resolutionTypeToSeconds(options.resolutionType)

    // Calculate fromTime to ToTime
    if (options.num) {
      const diffTime = options.num * intervalSecond * 1000

      if (options.fromTime && !options.toTime) {
        options.toTime = new Date(options.fromTime.getUTCMilliseconds() + diffTime)
      }
      if (!options.fromTime && options.toTime) {
        options.fromTime = new Date(options.toTime.getUTCMilliseconds() - diffTime)
      }
    }
        // UNIX_TIMESTAMP(m.min_time) * 1000 AS mintime,
        // UNIX_TIMESTAMP(m.max_time) * 1000 AS maxtime
    const fromTime = dateToMysqlFormat(options.fromTime)
    const toTime = dateToMysqlFormat(options.toTime)
    // console.log(fromTime, ' | ', toTime)
    const statement = `
    SELECT * FROM (
      SELECT m.symbol as sym, q1.bid AS bo,
        q2.bid AS bc,
        m.low AS bl,
        m.high AS bh,
        m.open_time AS sts,
        UNIX_TIMESTAMP(m.min_time) * 1000 AS mintime,
        UNIX_TIMESTAMP(m.max_time) * 1000 AS maxtime
    FROM (SELECT symbol,
        MIN(start) AS min_time,
        MAX(start) AS max_time,
        MIN(bid) AS low,
        MAX(bid) as high,
        floor(UNIX_TIMESTAMP(start) / ${intervalSecond}) * ${intervalSecond} * 1000 AS open_time
    FROM mysqlplustest.forex_quote
    WHERE symbol = "${options.symbol}" ${fromTime ? `AND start >= "${fromTime}"` : ''} ${toTime ? `AND start <= "${toTime}"` : ''}
    GROUP BY symbol, open_time) m
    JOIN mysqlplustest.forex_quote q1 ON m.min_time = q1.start
    JOIN mysqlplustest.forex_quote q2 ON m.max_time = q2.start
    ORDER BY open_time DESC
    ${options.num ? `LIMIT ${options.num}` : ''}
    ) result ORDER BY sts ASC;
    `
    // console.log('statement', statement)
    const results = await this._poolPlus.pquery(statement)
    if (results.length == 0) {
      return []
    }
    // const maxT =  df.column('maxtime').max()
    // console.log(df.getSeries('mintime'), df.getSeries('maxtime'))
    return results.map((r) => ({
      sym: r.sym,
      resolutionType: secondToResolutionType(r.resolution),
      sts: r.sts,
      ets: r.ets,
      bc: r.bc,
      bh: r.bh,
      bl: r.bl,
      bo: r.bo,
      v: r.v,
    } as CandleStickDTO))
  }

  async getCandle(options: {
    resolutionType: ResolutionType
    symbol: string
    fromTime?: Date
    toTime?: Date
  }): Promise<CandleStickDTO> {
    const fromTime = dateToMysqlFormat(options.fromTime)
    const toTime = dateToMysqlFormat(options.toTime)
    const interval = this.resolutionTypeToInverval(options.resolutionType)
    const statement = `
  SELECT m.symbol as sym, q1.bid AS bo,
      q2.bid AS bc,
      m.low AS bl,
      m.high AS bh,
      m.open_time as sts
  FROM (SELECT symbol, MIN(start) AS min_time,
      MAX(start) AS max_time,
      MIN(bid) AS low,
      MAX(bid) as high,
      floor(UNIX_TIMESTAMP(start) / (60 * ${interval}))* (60 * ${interval}) * 1000 AS open_time
      FROM mysqlplustest.forex_quote
      WHERE symbol = "${options.symbol}" ${fromTime ? `AND start >= "${fromTime}"` : ''} ${toTime ? `AND start <= "${toTime}"` : ''}
      GROUP BY symbol, open_time) m
      JOIN mysqlplustest.forex_quote q1 ON m.min_time = q1.start
      JOIN mysqlplustest.forex_quote q2 ON m.max_time = q2.start
      ORDER BY open_time DESC
      LIMIT 1;
  `
    const result = await this._poolPlus.pquery(statement)
    return {
      sym: options.symbol,
      resolutionType: options.resolutionType,
      sts: result[0].sts,
      bo: result[0].bo,
      bh: result[0].bh,
      bl: result[0].bl,
      bc: result[0].bc
    }
  }
}
