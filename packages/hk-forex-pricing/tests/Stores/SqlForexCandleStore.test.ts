import { PoolPlus } from 'mysql-plus'
import { SqlForexCandleStore } from '../../src/Stores/SqlForexCandleStore'

describe('SqlForexCandleStore', () => {
  const poolPlus = new PoolPlus({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    decimalNumbers: true,
  })
  const store = new SqlForexCandleStore(poolPlus)
  store.init()

  it('query OK', async () => {
      const num = 2
      const dateNow = Date.now()
      const nowTime = new Date(dateNow)
      const fromTime = new Date(dateNow - (80 * 60 * 1000))
      const candles = await store.getCandles({
        resolutionType: '1m',
        symbol: 'FM:EURUSD',
        fromTime: fromTime,
        toTime: nowTime,
        num: num,
      })

      expect(candles.sym).toBeTruthy()
      expect(candles.resolutionType).toBeTruthy()
      expect(candles.sts).toHaveLength(num)
      expect(candles.bo).toHaveLength(num)
      expect(candles.bh).toHaveLength(num)
      expect(candles.bl).toHaveLength(num)
      expect(candles.bc).toHaveLength(num)
      // expect(candles.firstStickSts).toBeLessThan(candles.lastStickSts)
      expect(candles.firstStickSts).toBeGreaterThan(candles.sts[0])
      expect(candles.lastStickSts).toBeGreaterThan(candles.sts[1])
      expect(candles.sts[0]).toBeLessThan(candles.sts[1])

      console.log(fromTime, nowTime, {
        ...candles,
        firstStickSts: new Date(candles.firstStickSts),
        lastStickSts: new Date(candles.lastStickSts)
      })
  })
})
