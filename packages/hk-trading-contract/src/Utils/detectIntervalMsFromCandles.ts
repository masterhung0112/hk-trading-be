import { DAY, MONTH } from '../Models/constants'

export function detectIntervalMsFromCandles(ohlcv: number[][]): number {
    const len = Math.min(ohlcv.length - 1, 99)
    let min = Infinity

    ohlcv.slice(0, len).forEach((x, i) => {
        const d = ohlcv[i + 1][0] - x[0]
        if (d === d && d < min) {
            min = d
        }
    })

    // This saves monthly chart from being awkward
    if (min >= MONTH && min <= DAY * 30) {
        return DAY * 31
    }
    return min
}