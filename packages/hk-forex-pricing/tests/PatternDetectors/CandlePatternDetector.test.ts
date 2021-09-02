import { CandleMultiStickDto, CandleStickDTO, IForexCandlesReadStore, PatternRecognitionDto } from 'hk-trading-contract'
import { Subject } from 'rxjs'
import { CandlePatternDetector } from '../../src/PatternDetectors/CandlePatternDetector'
import { ICandlestickFinder } from 'hk-technical-indicators'

describe('CandlePatternDetector', () => {
  const getCandles = jest.fn()
  // const saveCandle = jest.fn()
  // const saveManyCandles = jest.fn()
  const forexCandlesStore: IForexCandlesReadStore = {
    getCandles,
  }

  const hasPattern = jest.fn()

  const patterFinder: ICandlestickFinder = {
    hasPattern,
    id: 'helloid',
    name: 'hello',
    requiredCount: 1,
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('one candle, returns PatternRecognitionDto', (done) => {
    const detector = new CandlePatternDetector([patterFinder], forexCandlesStore)
    getCandles.mockResolvedValue({
      resolutionType: '1m',
      sym: 'test',
      sts: [123],
      bo: [30.10],
      bh: [32.10],
      bc: [30.13],
      bl: [28.10],
    } as CandleMultiStickDto)

    hasPattern.mockResolvedValue(true)
    const stream$ = new Subject<CandleStickDTO>()
    detector.getOutputStream([stream$]).subscribe({
      next: (patternRecognition) => {
        expect(patternRecognition).toEqual({
          patternSymbol: 'helloid',
          patternDisplayName: 'hello',
          resolutionType: '1m',
          symbol: 'test'
        } as PatternRecognitionDto)
      },
      complete: () => done()
    })

    stream$.next({
      resolutionType: '1m',
      bc: 0,
      bh: 0,
      bl: 0,
      bo: 0,
      sts: 0,
      sym: 'FM:EURUSD',
    })
    stream$.complete()
  })
})
