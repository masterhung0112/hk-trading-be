
export interface DataFrame {
    data: number[]
}

/*
Responsible to provide data to the bot
including ticker and orderbook data, live and historical candle (OHLCV) data
Common Interface for bot and strategy to access data.
*/
export interface IDataProvider {
    /*  Get stored historical candle (OHLCV) data
        :param pair: pair to get the data for
        :param timeframe: timeframe to get data for
    */
    historicOhlcv(pair: string, timeframe: string): DataFrame
}