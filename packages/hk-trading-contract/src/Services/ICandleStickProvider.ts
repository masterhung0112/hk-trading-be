import { SymbolInfo } from '../Models/SymbolInfo'
import { CandleStickDTO } from '../Models/CandleStickDto'
import { GetOhlcvOptions } from '../Models/GetOhlcvOptions'

/*
Responsible to provide data to the bot
including ticker and orderbook data, live and historical candle (OHLCV) data
Common Interface for bot and strategy to access data.
*/
export interface ICandleStickProvider {
    getSymbols(): SymbolInfo[]

    /*  Get stored historical candle (OHLCV) data
        :param pair: pair to get the data for
        :param timeframe: timeframe to get data for
    */
    getOhlcvBeforeTime(options: GetOhlcvOptions): CandleStickDTO[]
    getOhlcvAfterTime(options: GetOhlcvOptions): CandleStickDTO[]
}