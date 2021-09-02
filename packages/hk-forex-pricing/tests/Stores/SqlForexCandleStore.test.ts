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
      const candles = await store.getCandles({
        resolutionType: '1m',
        symbol: 'FM:EURUSD',
        // toTime: new Date(Date.now()),
        num: num,
      })

      expect(candles.sym).toBeTruthy()
      expect(candles.resolutionType).toBeTruthy()
      expect(candles.sts).toHaveLength(num)
      expect(candles.bo).toHaveLength(num)
      expect(candles.bh).toHaveLength(num)
      expect(candles.bl).toHaveLength(num)
      expect(candles.bc).toHaveLength(num)

      console.log(candles)
  })
})
