import { PoolPlus } from 'mysql-plus'
import { SqlForexCandleStore } from '../../src/Stores/SqlForexCandleStore'

describe('SqlForexCandleStore', () => {
  const poolPlus = new PoolPlus({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
  })
  const store = new SqlForexCandleStore(poolPlus)
  store.init()

  it('query OK', async () => {
      const candles = await store.getCandles({
        resolutionType: '1m',
        symbol: 'FM:EURUSD',
        num: 1,
      })

      console.log(candles)
  })
})
