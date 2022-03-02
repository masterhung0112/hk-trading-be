import { TradingChartPeriodParams, CandleQuoteDto, CandleStickDTO, ResolutionType } from 'hk-trading-contract'
import { IDataFrame, ISeries, Series } from 'hk-pd'

export class CandleProvider {
    protected currentOhlcv: IDataFrame<number, CandleStickDTO>
    
    constructor(protected datafeedUrl: string, protected requester: any) {

    }

    async getBars(
        symbolInfo: string,
        resolution: ResolutionType,
        periodParams: TradingChartPeriodParams,
    ): Promise<ISeries<CandleStickDTO>> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this
        const { from, to } = periodParams
        const requestParams = {
            symbol: symbolInfo || '',
            resolution: resolution,
            from: from,
            to: to,
        }
        return new Series()
        // return self.requester.sendRequest(self.datafeedUrl, 'history', requestParams)
        //     .then(function (response) {
        //         if (response.s !== 'ok' && response.s !== 'no_data') {
        //             throw new Error(response.errmsg)
        //         }
        //         const bars = []
        //         const meta = {
        //             noData: false,
        //         }
        //         if (response.s === 'no_data') {
        //             meta.noData = true
        //             meta.nextTime = response.nextTime
        //         }
        //         else {
        //             const volumePresent = response.v !== undefined
        //             const ohlPresent = response.o !== undefined
        //             for (let i = 0; i < response.t.length; ++i) {
        //                 const barValue = {
        //                     time: response.t[i] * 1000,
        //                     close: Number(response.c[i]),
        //                     open: Number(response.c[i]),
        //                     high: Number(response.c[i]),
        //                     low: Number(response.c[i]),
        //                 }
        //                 if (ohlPresent) {
        //                     barValue.open = Number(response.o[i])
        //                     barValue.high = Number(response.h[i])
        //                     barValue.low = Number(response.l[i])
        //                 }
        //                 if (volumePresent) {
        //                     barValue.volume = Number(response.v[i])
        //                 }
        //                 bars.push(barValue)
        //             }
        //         }
        //         return ({
        //             bars: bars,
        //             meta: meta,
        //         })
        //     })
    }

    updateTick(ohlcv: IDataFrame<number, CandleStickDTO>, quote: CandleQuoteDto, resolutionSecond: number): IDataFrame<number, CandleStickDTO> {
        const lastBar = ohlcv.last()
        const tf = resolutionSecond * 1000
        const t_next = lastBar.sts + tf
        const now = Date.now()
        const t = now >= t_next ? (now - now % tf) : lastBar.sts
        const tick = quote.b // bid price
        const volume = quote.v || 0

        if ((t >= t_next || ohlcv.any()) && tick !== undefined) {
            // a new zeo-height candle
            const newStick: CandleStickDTO = {
                ...lastBar,
                sts: t,
                bo: tick,
                bh: tick,
                bl: tick,
                bc: tick,
                v: volume
            }
            const newOhlcv = ohlcv.appendPair([t, newStick])
            // holcv
            // setData()
            // scroll_to(t)
            return newOhlcv
        } else if (tick != undefined) {
            // Update an existing one
            
        }
    }

    // Take a single trade, and subscription record, return updated bar
    updateBar(data: CandleStickDTO, lastBar: CandleStickDTO, resolutionSecond: number) {
        // const coeff = resolutionSecond
        // console.log({coeff})
        // const rounded = Math.floor(data.ts / coeff) * coeff
        // const lastBarSec = lastBar.time / 1000
        let updatedLastBar: CandleStickDTO = {...lastBar}

        // if (rounded > lastBarSec) {
        //     // create a new candle, use last close as open **PERSONAL CHOICE**
        //     updatedLastBar = {
        //         ...updatedLastBar,
        //         sts: rounded * 1000,
        //         bo: lastBar.bc,
        //         bh: lastBar.bc,
        //         bl: lastBar.bc,
        //         bc: data.price,
        //         v: data.v
        //     }

        // } else {
        //     // update lastBar candle!
        //     if (data.price < lastBar.bl) {
        //         lastBar.bl = data.price
        //     } else if (data.price > lastBar.bh) {
        //         lastBar.bh = data.price
        //     }

        //     lastBar.v += data.v
        //     lastBar.bc = data.price
        //     updatedLastBar = lastBar
        // }
        return updatedLastBar
    }
   
}