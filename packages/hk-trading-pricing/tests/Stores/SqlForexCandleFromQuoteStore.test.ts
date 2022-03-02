import { PoolPlus } from 'mysql-plus'
import { SqlForexCandleFromQuoteStore } from '../../src/Stores/SqlForexCandleFromQuoteStore'

describe('SqlForexCandleFromQuoteStore', () => {
  const poolPlus = new PoolPlus({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    decimalNumbers: true,
  })
  const store = new SqlForexCandleFromQuoteStore(poolPlus)
  store.init()

  it('query OK', async () => {

      const num = 2
      const dateNow = Date.UTC(2021, 12, 1, 10, 0, 0)
      const nowTime = new Date(dateNow)
      const fromTime =  new Date(dateNow - (80 * 60 * 1000))
      store.saveCandle({
        resolutionType: '1m',
        sym: 'FM:EURUSD',
        sts: fromTime,
        ets: nowTime,
        bo: 1,
        bl: 2,
        bh: 3,
        bc: 4,
        v: num,
      })

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
      // expect(candles[0].firstStickSts).toBeGreaterThan(candles[0].sts)
      // expect(candles[0].lastStickSts).toBeGreaterThan(candles[1].sts)
      expect(candles[0].sts.getSeconds()).toBeLessThan(candles[1].sts.getSeconds())

      // console.log(fromTime, nowTime, {
      //   ...candles,
      //   firstStickSts: new Date(candles.firstStickSts),
      //   lastStickSts: new Date(candles.lastStickSts)
      // })
  })
})
