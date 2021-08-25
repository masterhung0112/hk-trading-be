import {Command, flags} from '@oclif/command'
import { of, mergeMap, timeout, catchError } from 'rxjs'
import { PoolPlus } from 'mysql-plus'
import { FxcmAdapter } from '../PriceSourceAdapters/FxcmAdapter'
import { SqlForexQuoteStore } from '../Stores/SqlForexQuoteStore'
import dotenv from 'dotenv'

dotenv.config({path: './env/.env.local'})

export default class QuoteToDB extends Command {
  static description = 'describe the command here'

  static examples = [
    `$ hk quote:todb
`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'n', description: 'name to print'}),
  }

  static args = [{name: 'file'}]

  async run() {
    const {args, flags} = this.parse(QuoteToDB)

    const poolPlus = new PoolPlus({
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DB,
    })
    const store = new SqlForexQuoteStore(poolPlus)
    const adapter = new FxcmAdapter()

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
                catchError((err => {
                    if (err.message != 'timeout') {
                        // done(err)
                    }
                    return of()
                })),
                // take(10)
            )
        ),
        mergeMap(async (data) => {
            console.log(data)
            return await store.saveTick({
                symbol: `FM:${data.symbol}`,
                start: data.start,
                bid: data.bid,
                ask: data.ask,
            })
        })
    )
    .subscribe({
        next: () => {
            // if (result) {
            //     console.log('result', result)
                // await store.saveTick({
                //     symbol: `FM:${data.CurrencyPair.Symbol}`,
                //     start: data.Date,
                //     bid: data.Bid,
                //     // ask: data.
                // })
            // }
        },
        error: (err) => {console.log(err)}
    })
  }
}
