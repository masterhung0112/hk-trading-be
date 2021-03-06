import { ICandlesReadStore, CandleStickDTO, resolutionTypeToSeconds, secondToResolutionType, GetCandlesOption, GetCandleOption, ICandlesWriteStore, ICandlesDeleteStore, DeleteCandleOption, DeleteCandlesOption } from 'hk-trading-contract'
import { Pool, RowDataPacket } from 'mysql2/promise'
import { dateToMysqlFormat } from 'mysql-plus'

const FOREX_CANDLE_TABLE_NAME = 'forex_candlesticks'

export class SqlForexCandleStore implements ICandlesReadStore, ICandlesWriteStore, ICandlesDeleteStore {
  // private forexCandleTable: MySQLTable

  constructor(protected mysqlPool: Pool) {
    // this.forexCandleTable = new MySQLTable('forex_candlesticks', {}, this._poolPlus)
  }


  init() {
    return this.mysqlPool.query(`
        CREATE TABLE IF NOT EXISTS ${FOREX_CANDLE_TABLE_NAME}(
            sym VARCHAR(32) NOT NULL,
            resolution INT NOT NULL,
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
    await this.mysqlPool.execute(
      `INSERT INTO ${FOREX_CANDLE_TABLE_NAME}(sym, resolution, sts, ets, bo, bh, bl, bc, v)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [candle.sym, resolutionTypeToSeconds(candle.resolutionType), dateToMysqlFormat(candle.sts), dateToMysqlFormat(candle.ets), candle.bo, candle.bh, candle.bl, candle.bc, candle.v]
    )
  }

  async saveManyCandles(candles: CandleStickDTO[]): Promise<void> {
    const sql = `INSERT INTO ${FOREX_CANDLE_TABLE_NAME}(sym, resolution, sts, ets, bo, bh, bl, bc, v) VALUES ?`
    const values = candles.map((candle) => ([candle.sym, resolutionTypeToSeconds(candle.resolutionType), dateToMysqlFormat(candle.sts), dateToMysqlFormat(candle.ets), candle.bo, candle.bh, candle.bl, candle.bc, candle.v]))
    await this.mysqlPool.query(sql, [values])
  }

  async getCandles(options: GetCandlesOption): Promise<CandleStickDTO[]> {
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

    const fromTime = dateToMysqlFormat(options.fromTime)
    const toTime = dateToMysqlFormat(options.toTime)
    const interval = resolutionTypeToSeconds(options.resolutionType)

    const statement = `
    SELECT (sym, resolution, sts, ets, bo, bh, bl, bc, v) FROM ${FOREX_CANDLE_TABLE_NAME}
    WHERE sym = "${options.symbolId}" AND resolution = ${interval} ${fromTime ? `AND sts >= "${fromTime}"` : ''} ${toTime ? `AND sts <= "${toTime}"` : ''}
    ORDER BY sym ASC, sts ASC
    ${options.num ? `LIMIT ${options.num}` : ''}
    `
    // console.log('statement', statement)
    const [results] = await this.mysqlPool.query<RowDataPacket[]>({
      sql: statement,
      rowsAsArray: true,
    })
    if (results.length == 0) {
      return []
    }
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

  async getCandle(options: GetCandleOption): Promise<CandleStickDTO | null> {
    const fromTime = dateToMysqlFormat(options.fromTime)
    const toTime = dateToMysqlFormat(options.toTime)
    const interval = resolutionTypeToSeconds(options.resolutionType)
    const statement = `
  SELECT (sym, resolution, sts, ets, bo, bh, bl, bc, v)
  FROM ${FOREX_CANDLE_TABLE_NAME}
      WHERE sym = "${options.symbolId}" AND resolution = ${interval} ${fromTime ? `AND sts >= "${fromTime}"` : ''} ${toTime ? `AND sts <= "${toTime}"` : ''}
      ORDER BY sts DESC
      LIMIT 1;
  `
    const [result] = await this.mysqlPool.query<RowDataPacket[]>({
      sql: statement,
      rowsAsArray: true,
    })
    if (result.length === 0) {
      return null
    }
    return {
      sym: options.symbolId,
      resolutionType: options.resolutionType,
      sts: result[0].sts,
      bo: result[0].bo,
      bh: result[0].bh,
      bl: result[0].bl,
      bc: result[0].bc
    }
  }

  async deleteCandle(option: DeleteCandleOption): Promise<void> {
    await this.mysqlPool.execute(
      `DELETE FROM ${FOREX_CANDLE_TABLE_NAME}
      WHERE sym = ? AND resolution = ? AND sts = ?`, [option.symbolId, resolutionTypeToSeconds(option.resolutionType), dateToMysqlFormat(option.sts)]
    )
  }

  async deleteCandles(option: DeleteCandlesOption): Promise<void> {
    const sql = `DELETE FROM ${FOREX_CANDLE_TABLE_NAME} WHERE sym = "${option.symbolId}" AND resolution = ${resolutionTypeToSeconds(option.resolutionType)} ${option.fromTime ? `AND sts >= "${dateToMysqlFormat(option.fromTime)}"` : ''} ${option.toTime ? `AND sts <= "${dateToMysqlFormat(option.toTime)}"` : ''}`
    await this.mysqlPool.query(sql)
  }
}
