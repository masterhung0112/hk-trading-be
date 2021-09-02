import {Command, flags} from '@oclif/command'
import { of, mergeMap, from } from 'rxjs'
import { PoolPlus } from 'mysql-plus'
import { FxcmAdapter } from '../../PriceSourceAdapters/FxcmAdapter'
import { SqlForexQuoteStore } from '../../Stores/SqlForexQuoteStore'
import dotenv from 'dotenv'
import { SqlForexCandleStore } from '../../Stores/SqlForexCandleStore'

dotenv.config({path: './env/.env.local'})

export default class QuoteTo1m extends Command {
  static description = 'describe the command here'

  static examples = [
    `$ hk quote:1m
`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'n', description: 'name to print'}),
  }

  static args = [{name: 'file'}]

  async run() {
    const poolPlus = new PoolPlus({
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DB,
    })
    const forexQuoteStore = new SqlForexQuoteStore(poolPlus)
    const forexCandlesStore = new SqlForexCandleStore(poolPlus)
    const adapter = new FxcmAdapter()

    of(forexQuoteStore.init()).pipe(
        mergeMap(() =>
            adapter.createQuote('EUR/USD')
        ),
        mergeMap(async (data) => {
            await forexQuoteStore.saveTick(data)
            return data
        }, 5),
        mergeMap((data) => {
          return from(forexCandlesStore.getCandles({
            resolutionType: '1m',
            toTime: new Date(data.sts),
            num: 1
          }))
        })
    )
    .subscribe({
        next: (candleMultiStickDto) => {
          console.log(candleMultiStickDto)
        },
        error: (err) => {console.log(err)}
    })
  }
}
