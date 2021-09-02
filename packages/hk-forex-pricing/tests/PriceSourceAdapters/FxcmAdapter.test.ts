import { mergeMap, of, take, timeout } from 'rxjs'
import { PoolPlus } from 'mysql-plus'
import { SqlForexQuoteStore } from '../../src/Stores/SqlForexQuoteStore'
import { FxcmAdapter } from '../../src/PriceSourceAdapters/FxcmAdapter'

jest.setTimeout(30000)

test('FxcmAdapter.createQuote run OK', (done) => {
  const adapter = new FxcmAdapter()

  adapter.createQuote('EUR/USD').pipe(
    timeout({
      first: 20000,
      each: 10000,
    }),
    take(10)
  ).subscribe({
    next: (data) => {
      if (data) {
        console.log(data)
      }
    },
    error: (err) => done(err),
    complete: () => {
      adapter.close()
      done()
    }
  })
})

test('FxcmAdapter.createCandlesStream run OK', (done) => {
  const adapter = new FxcmAdapter()

  adapter.createCandlesStream('EUR/USD', '1m', {
    fromTimestamp: new Date(Date.now() - (120 * 1000)),
    toTimestamp: new Date(Date.now()),
    num: 1
  }).pipe(
    timeout({
      first: 20000,
      each: 10000,
      with: () => {
        throw new Error('timeout')
      }
    }),
    // take(10)
  ).subscribe({
    next: (data) => {
      if (data) {
        console.log(data)
        done()
      }
    },
    complete: () => {
      adapter.close()
    },
    error: (err) => done(err)
  })
})

test('FxcmAdapter run OK + Save DB', (done) => {
  expect(process.env.MYSQL_HOST).toBeTruthy()

  const adapter = new FxcmAdapter()
  const poolPlus = new PoolPlus({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    decimalNumbers: true,
  })
  const store = new SqlForexQuoteStore(poolPlus)

  afterAll(() => {
    poolPlus.destroy()
  })

  of(store.init()).pipe(
    mergeMap(() =>
      adapter.createQuote('EUR/USD').pipe(
        timeout({
          each: 20000,
          with: () => {
            // done(new Error('timeout'))
            throw new Error('timeout')
          }
        }),
        take(10)
      )
    ),
    mergeMap(async (data) => {
      // console.log(data)
      return await store.saveTick({
        symbol: `FM:${data.symbol}`,
        start: data.start,
        bid: data.bid,
        ask: data.ask
      })
    })
  )
    .subscribe({
      next: async (result) => {
        if (result) {
          console.log('result', result)
          // await store.saveTick({
          //     symbol: `FM:${data.CurrencyPair.Symbol}`,
          //     start: data.Date,
          //     bid: data.Bid,
          //     // ask: data.
          // })
        }
      },
      error: (err) => done(err),
      complete: () => {
        done()
        adapter.close()
      }
    })
})
