import { Command, flags } from '@oclif/command'
import { of, mergeMap, from, distinctUntilChanged, tap } from 'rxjs'
import { PoolPlus } from 'mysql-plus'
import { FxcmAdapter } from '../../PriceSourceAdapters/FxcmAdapter'
import { SqlForexQuoteStore } from '../../Stores/SqlForexQuoteStore'
import dotenv from 'dotenv'
import { SqlForexCandleStore } from '../../Stores/SqlForexCandleStore'
import { CandlePatternDetector } from '../../PatternDetectors/CandlePatternDetector'
import { BearishHammerStick, Doji, HammerPattern, BearishInvertedHammerStick, BullishInvertedHammerStick, BullishHammerStick } from 'hk-technical-indicators'

dotenv.config({ path: './env/.env.local' })

export default class QuoteTo1mPattern extends Command {
  static description = 'describe the command here'

  static examples = [
    `$ hk quote:1mPattern
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
    const forexQuoteStore = new SqlForexQuoteStore(poolPlus)
    const forexCandlesStore = new SqlForexCandleStore(poolPlus)
    const adapter = new FxcmAdapter()
    const patternDetector = new CandlePatternDetector([
      new Doji(),
      new HammerPattern(),
      new BearishHammerStick(),
      new BearishInvertedHammerStick(),
      new BullishHammerStick(),
      new BullishInvertedHammerStick()
    ], forexCandlesStore)

    const candleStickStream$ = of(forexQuoteStore.init()).pipe(
      mergeMap(() =>
        adapter.createQuote('EUR/USD')
      ),
      mergeMap(async (data) => {
        await forexQuoteStore.saveTick(data)
        return data
      }, 5),
      mergeMap((data) => {
        return from(forexCandlesStore.getCandle({
          resolutionType: '1m',
          symbol: data.sym,
          toTime: new Date(data.sts),
        }))
      }),
      distinctUntilChanged((previous, current) => (previous.bo === current.bo && previous.bh === current.bh && previous.bl === current.bl && previous.bc === current.bc)),
      // tap((data) => console.log(data))
    )

    patternDetector.getOutputStream([candleStickStream$])
      .subscribe({
        next: (patternRecognitionDto) => {
          if (patternRecognitionDto) {
            console.log({
              ...patternRecognitionDto,
              sts: new Date(patternRecognitionDto.sts)
            })
          }
        },
        error: (err) => { console.log(err) }
      })
  }
}
