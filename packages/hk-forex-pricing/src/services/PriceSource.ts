import { Subscription } from 'rxjs'
import { CurrencyPair } from '../constracts/CurrencyPair'
import { IMarketDataAdapter } from '../constracts/IMarketDataAdapter'
import { IPriceGenerator } from '../constracts/IPriceGenerator'
import { HardCodedSourceName } from '../contants/PriceSource'
import { MeanReversionRandomWalkPriceGenerator } from '../PriceGenerator/MeanReversionRandomWalkPriceGenerator'

export class PriceSource {
    private _marketAdapters: IMarketDataAdapter[]
    private _marketAdaptersSubscription: Subscription[] = []
    private _priceGenerators: Map<string, IPriceGenerator>

    constructor(marketAdapters: IMarketDataAdapter[]) {
        this._marketAdapters = marketAdapters
        this._priceGenerators = new Map<string, IPriceGenerator>()

        const createPriceGenerator = (baseCcy: string, quoteCcy: string, initial: number, precision: number): IPriceGenerator => {
            return new MeanReversionRandomWalkPriceGenerator(new CurrencyPair(baseCcy, quoteCcy), initial, precision)
        }

        [
            createPriceGenerator('EUR', 'USD', 1.09443, 5),
            createPriceGenerator('USD', 'JPY', 121.656, 3),
        ].forEach((item) => {
            this._priceGenerators.set(item.CurrencyPair.Symbol, item)
        })
    }

    // startFetchingMarketRates() {
    //     for (const adapter of this._marketAdapters) {
    //         const subscription = adapter.marketDataObservable.subscribe({
    //             next: (marketDatas) => {
    //                 for (const marketData of marketDatas) {
    //                     const priceGenerator = this._priceGenerators.get(marketData.CurrencyPair.Symbol)
    //                     // Any item older than 10 minutes is considered available to update, this way if the preceeding adapters did not update the rate then perhaps the next adapter will
    //                     if (
    //                         priceGenerator &&
    //                         (Date.now() - priceGenerator.EffectiveDate.getTime()) > (10 * 60 * 1000)) {
    //                         priceGenerator.UpdateInitialValue(marketData.Bid, new Date(marketData.Date), marketData.Source)
    //                     }
    //                 }
    //             },
    //             complete: () => {
    //                 for (const k of this._priceGenerators.keys()) {
    //                     adapter.unsubscribe(k)
    //                 }
    //             }
    //         })

    //         this._marketAdaptersSubscription.push(subscription)

    //         // Subscribe to start listening to a specific symbol
    //         for (const k of this._priceGenerators.keys()) {
    //             adapter.subscribe(k)
    //         }
    //     }
    // }

    stopFetchingMarkRate() {
        this._marketAdaptersSubscription.forEach((s) => s.unsubscribe())
        this._marketAdaptersSubscription = []
    }

    /*
        - Iterate market data adapter
        - For each market data adapter
            Retrieve new market data for all currency pair subscribed for that Market Data Adapter
            Push new market data to price generator
    */
    // async RefreshMarketRates() {
    //     // Try to call GetMarketData() of all MarketAdapter
    //     for (let adapter of this._marketAdapters)
    //     {
    //         try
    //         {
    //             var marketData = await adapter.GetMarketData();
    //             for (let item of marketData)
    //             {
    //                 const priceGenerator = this._priceGenerators.get(item.CurrencyPair.Symbol)
    //                 // Any item older than 10 minutes is considered available to update, this way if the preceeding adapters did not update the rate then perhaps the next adapter will
    //                 if (
    //                     priceGenerator &&
    //                     (Date.now() - priceGenerator.EffectiveDate.getTime()) > (10 * 60 * 1000))
    //                 {
    //                     priceGenerator.UpdateInitialValue(item.SampleRate, new Date(item.Date), item.Source);
    //                 }
    //             }
    //         }
    //         catch(ex)
    //         {
    //             console.error(ex, `Adapter for ${adapter.RequestUriString} threw an unhandled exception`);
    //         }
    //     }
    //     this.computeMissingReciprocals();
    //     // _lastMarketUpdate = refreshDateTime;
    // }

    // Currency pairs are typically listed only as Major/Minor CCY codes. This method computes the reciprocal rate for missing Minor/Majors
    computeMissingReciprocals() {
        for (const value of Array.from(this._priceGenerators.values())) {
            if (value.SourceName === HardCodedSourceName || value.SourceName.indexOf('1/') !== -1) {
                const other = this._priceGenerators.get(value.CurrencyPair.ReciprocalSymbol)
                if (other && other.SourceName !== HardCodedSourceName) {
                    value.UpdateInitialValue(1 / other.SampleRate, other.EffectiveDate, `1/ ${other.SourceName}`)
                }
            }
        }
    }
}
