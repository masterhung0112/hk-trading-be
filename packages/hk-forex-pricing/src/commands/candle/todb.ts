import { Command, flags } from '@oclif/command'
import { of, mergeMap, interval } from 'rxjs'
import { PoolPlus } from 'mysql-plus'
import { FxcmAdapter } from '../../PriceSourceAdapters/FxcmAdapter'
import { SqlForeCandleFromQuoteStore } from '../../Stores/SqlForeCandleFromQuoteStore'
import dotenv from 'dotenv'
import { CandleStickBidAskDTO } from 'hk-trading-contract'

dotenv.config({ path: './env/.env.local' })

export default class QuoteToDB extends Command {
  static description = 'describe the command here'

  static examples = [
    `$ hk quote:todb
`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: 'n', description: 'name to print' }),
  }

  static args = [{ name: 'file' }]

  async run() {
    const poolPlus = new PoolPlus({
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
      database: process.env.MYSQL_DB,
      decimalNumbers: true,
    })
    const store = new SqlForeCandleFromQuoteStore(poolPlus)
    const adapter = new FxcmAdapter()

    let lastTimestamp = new Date(Date.now() - (120 * 1000))

    of(store.init()).pipe(
      mergeMap(() => interval(1000)),
      mergeMap(() => {
        const newTime = new Date(Date.now())
        const s = adapter.createCandlesStream('EUR/USD', '1m', {
          fromTimestamp: lastTimestamp,
          toTimestamp: newTime,
          num: 1
        })
        lastTimestamp = newTime
        return s
      }),
      mergeMap(async (candles) => {
        console.log(candles)
        for (const candle of candles) {
          const c = candle as CandleStickBidAskDTO
          await store.saveCandle({
            sym: candle.sym,
            sts: candle.sts,
            // ets:
            bo: c.bo,
            bh: c.bh,
            bl: c.bl,
            bc: c.bc,
            ao: c.ao,
            ah: c.ah,
            al: c.al,
            ac: c.ac,
            v: c.v
          } as CandleStickBidAskDTO)
        }
        return of()
      }),
    )
      .subscribe({
        error: (err) => { console.log(err) }
      })
  }
}
