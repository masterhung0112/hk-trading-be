import { IForexCandlesReadStore } from 'hk-trading-contract'
import { Subject } from 'rxjs'
import { CandlePatternDetector, CandlePatternStreamInput } from '../../src/PatternDetectors/CandlePatternDetector'
import { ICandlestickFinder } from 'hk-technical-indicators'

describe('CandlePatternDetector', () => {
  const getCandles = jest.fn()
  // const saveCandle = jest.fn()
  // const saveManyCandles = jest.fn()
  const forexCandlesStore: IForexCandlesReadStore = {
    getCandles,
  }

  const patterFinder: ICandlestickFinder = {
    hasPattern: jest.fn(),
    name: 'hello',
    requiredCount: 1,
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('one candle, detector returns true', (done) => {
    const detector = new CandlePatternDetector([patterFinder], forexCandlesStore)

    // getCandles.mockreturn

    const stream$ = new Subject<CandlePatternStreamInput>()
    detector.getOutputStream([stream$]).subscribe({
      next: (patternRecognition) => {
        console.log(patternRecognition)
      },
      complete: () => done()
    })

    stream$.next({
      resolutionType: '1m',
      sticks: {
        bc: 0,
        bh: 0,
        bl: 0,
        bo: 0,
        sts: 0,
        sym: '',
      }
    })
  })
})
