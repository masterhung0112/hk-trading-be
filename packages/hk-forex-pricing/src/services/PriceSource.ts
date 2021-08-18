import { IMarketDataAdapter } from "../constracts/IMarketDataAdapter";

export class PriceSource {
    _marketAdapters: IMarketDataAdapter[]

    /*
        - Iterate market data adapter
        - For each market data adapter
            Retrieve new market data for all currency pair subscribed for that Market Data Adapter
            Push new market data to price generator
    */
    async RefreshMarketRates() {
        // Try to call GetMarketData() of all MarketAdapter
        for (let adapter of this._marketAdapters)
        {
            try
            {
                var marketData = await adapter.GetMarketData();
                for (let item in marketData)
                {
                    //Any item older than 10 minutes is considered available to update, this way if the preceeding adapters did not update the rate then perhaps the next adapter will
                    if (
                    PriceGenerators.TryGetValue(item.CurrencyPair.Symbol, out IPriceGenerator priceGenerator) &&
                    (DateTime.UtcNow - priceGenerator.EffectiveDate).TotalMinutes > 10)
                    {
                    priceGenerator.UpdateInitialValue(item.SampleRate, item.Date, item.Source);
                    }
                }
            }
            catch(ex)
            {
                // Log.Error(ex, $"Adapter for {adapter.RequestUriString} threw an unhandled exception");
            }
        }
        ComputeMissingReciprocals();
        _lastMarketUpdate = refreshDateTime;
    }
}