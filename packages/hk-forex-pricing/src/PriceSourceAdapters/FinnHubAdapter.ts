import { IMarketDataAdapter } from "../constracts/IMarketDataAdapter";
import { MarketData } from "../constracts/MarketData";
import finnhub from 'finnhub'
import { CurrencyPair } from "../constracts/CurrencyPair";

const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = "<API key>"
const finnhubClient = new finnhub.DefaultApi()

export class FinnHubAdapter implements IMarketDataAdapter {

    // private _requestUriString = "https://api.exchangeratesapi.io/latest";

    get RequestUriString(): string {
        return ''
    }

    GetMarketData(): Promise<MarketData[]> {
        return new Promise((resolve, reject) => {
            finnhubClient.forexCandles("OANDA:EUR_USD", "1", Date.now() - 5000, Date.now(), (error, data, response) => {
                if (error) {
                    reject(error)
                } else {
                    const results = []
                    const currencyPair = new CurrencyPair('EURUSD')
                    // results.push(new MarketData(currencyPair, 0, data['t']))
                }
            })
        })
        // for (var baseCcy in PriceSource.GetAllBaseCurrencies())
        // {
        //     //We do multiple requests, one for each base ccy
        //     var symbols = string.Join(',', PriceSource.GetAllQuoteCurrencies(baseCcy));
        //     var queryParameters = $"?base={baseCcy}&symbols={symbols}";
        //     var json = await _adapter.GetRequestJson(queryParameters);
        //     results.Add(json);
        // }
        // return new JArray(results);
        // }

    }
}