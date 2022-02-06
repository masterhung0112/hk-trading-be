import { IChartSubplotData } from 'hk-trading-contract'

interface TradingChartInternalConfig {
    data: IChartSubplotData
}

export class TradingChartConfig {
    protected config: TradingChartInternalConfig

    constructor(userConfig: Record<string, any>) {
        this.initConfig(userConfig)
    }

    protected initConfig(userConfig?: Record<string, any>) {
        const internalConfig: TradingChartInternalConfig = userConfig ? {...userConfig} as TradingChartInternalConfig : {
            data: undefined
        }
        internalConfig.data = this.initData(internalConfig.data)
        
        return internalConfig
    }

    protected initData(userData?: IChartSubplotData) {
        userData = userData || { chart: [], onchart: [], offchart: [] }
        userData.chart = userData.chart || []
        userData.onchart = userData.onchart || []
        userData.offchart = userData.offchart || []
        return userData
    }

    get data() {
        return this.config.data
    }
}