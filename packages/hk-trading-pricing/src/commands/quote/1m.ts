import {Command, flags} from '@oclif/command'
import { of, mergeMap, from, distinctUntilChanged } from 'rxjs'
import { PoolPlus } from 'mysql-plus'
import { FxcmAdapter } from '../../PriceSourceAdapters/FxcmAdapter'
import { SqlForexQuoteStore } from '../../Stores/SqlForexQuoteStore'
import dotenv from 'dotenv'
import { SqlForexCandleFromQuoteStore } from '../../Stores/SqlForexCandleFromQuoteStore'

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
        decimalNumbers: true,
    })
    const forexQuoteStore = new SqlForexQuoteStore(poolPlus)
    const forexCandlesStore = new SqlForexCandleFromQuoteStore(poolPlus)
    const adapter = new FxcmAdapter()

    of(forexQuoteStore.init()).pipe(
        mergeMap(() =>
            adapter.createQuote('EUR/USD')
        ),
        mergeMap(async (data) => {
            // console.log({
            //   ...data,
            //   sts: new Date(data.sts)
            // })
            await forexQuoteStore.saveTick(data)
            return data
        }, 5),
        mergeMap((data) => {
          return from(forexCandlesStore.getCandles({
            resolutionType: '1m',
            symbol: data.sym,
            // toTime: new Date(data.sts),
            num: 1
          }))
        }),
        distinctUntilChanged((previous, current) => (current.length > 0 && previous[0].bo === current[0].bo && previous[0].bh === current[0].bh && previous[0].bl === current[0].bl && previous[0].bc === current[0].bc))
    )
    .subscribe({
        next: (candleMultiStickDto) => {
          if (candleMultiStickDto.length > 0) {
            console.log(candleMultiStickDto)
            // patternDetector.getOutputStream()
          }
        },
        error: (err) => {console.log(err)}
    })
  }
}
