import { CandleStickDTO } from '../Models/CandleStickDto'
import { GetOhlcvOptions } from '../Models/GetOhlcvOptions'
import { SymbolInfo } from '../Models/SymbolInfo'

export interface ICandleProviderDashboard {
    getSymbols(): SymbolInfo[]
    getCandlesAfter(options: GetOhlcvOptions): CandleStickDTO[]
    getCandlesBefore(options: GetOhlcvOptions): CandleStickDTO[]
}