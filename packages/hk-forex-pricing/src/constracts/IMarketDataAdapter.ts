import { MarketData } from "./MarketData";

export interface IMarketDataAdapter {
    get RequestUriString(): string
    GetMarketData(): Promise<MarketData[]>
}