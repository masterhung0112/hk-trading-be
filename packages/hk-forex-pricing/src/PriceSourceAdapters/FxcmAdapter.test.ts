import { catchError, of, take, timeout } from "rxjs"
import { MarketData } from "../constracts/MarketData"
import { FxcmAdapter } from "./FxcmAdapter"

jest.setTimeout(30000)

test('FxcmAdapter run OK', (done) => {
    const adapter = new FxcmAdapter()

    adapter.marketDataObservable.subscribe((marketDatas) => {
        console.log(marketDatas)
    })

    adapter.createQuote("EUR/USD").pipe(
        timeout({
            first: 20000,
            with: () => {
                done(new Error('timeout'))
                throw new Error('timeout')
            }
        }),
        catchError((err => {
            if (err.message != 'timeout') {
                done(err)
            }
            return of()
        })),
        take(10)
    ).subscribe((data) => {
        if (data) {
            console.log(data)
            done()
        }
    })

    // await new Promise(resolve =>
    //     setTimeout(resolve, 15000),
    // )
    // adapter.unsubscribe("EUR/USD")
})
