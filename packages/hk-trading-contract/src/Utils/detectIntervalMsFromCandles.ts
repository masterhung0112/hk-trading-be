import { IDataFrame } from 'hk-pd'
import { CandleStickDTO } from '../Models/CandleStickDto'
import { DAY, MONTH } from '../Models/constants'

export function detectIntervalMsFromCandles(ohlcv: IDataFrame<number, CandleStickDTO>): number {
    const len = Math.min(ohlcv.count() - 1, 99)
    let min = Infinity

    for (const [i, x] of ohlcv.take(len).toPairs()) {
        const d = ohlcv.at(i + 1).sts - x.sts
        if (d === d && d < min) {
            min = d
        }
    }

    // This saves monthly chart from being awkward
    if (min >= MONTH && min <= DAY * 30) {
        return DAY * 31
    }
    return min
}