import { PoolPlus } from 'mysql-plus'
import { SqlForeCandleFromQuoteStore } from '../../src/Stores/SqlForeCandleFromQuoteStore'

describe('SqlForeCandleFromQuoteStore', () => {
  const poolPlus = new PoolPlus({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    decimalNumbers: true,
  })
  const store = new SqlForeCandleFromQuoteStore(poolPlus)
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

      expect(candles[0].sym).toBeTruthy()
      expect(candles[0].resolutionType).toBeTruthy()
      expect(candles[0].sts).toHaveLength(num)
      expect(candles[0].bo).toHaveLength(num)
      expect(candles[0].bh).toHaveLength(num)
      expect(candles[0].bl).toHaveLength(num)
      expect(candles[0].bc).toHaveLength(num)
      // expect(candles.firstStickSts).toBeLessThan(candles.lastStickSts)
      expect(candles[0].firstStickSts).toBeGreaterThan(candles[0].sts)
      expect(candles[0].lastStickSts).toBeGreaterThan(candles[1].sts)
      expect(candles[0].sts).toBeLessThan(candles[1].sts)

      // console.log(fromTime, nowTime, {
      //   ...candles,
      //   firstStickSts: new Date(candles.firstStickSts),
      //   lastStickSts: new Date(candles.lastStickSts)
      // })
  })
})
