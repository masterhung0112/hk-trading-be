import { CurrencyPair } from "../constracts/CurrencyPair"
import { IMarketDataAdapter } from "../constracts/IMarketDataAdapter"
import { MarketData } from "../constracts/MarketData"
import { PriceSource } from "./PriceSource"

const requestUri = "http://localhost-test"

class TestNarketDataAdapter implements IMarketDataAdapter {
    get RequestUriString(): string {
        return requestUri
    }

    async GetMarketData(): Promise<MarketData[]> {
        return [new MarketData(
            new CurrencyPair("EURUSD"), 1 + Math.random(), Date.now(), ""
        )]
    }

}

describe('PriceSource', () => {
    it('RefreshMarketRates run with empty adapter', () => {
        const dataAdapter = new TestNarketDataAdapter()
        const priceSource = new PriceSource([dataAdapter])
        priceSource.RefreshMarketRates()
    })
})