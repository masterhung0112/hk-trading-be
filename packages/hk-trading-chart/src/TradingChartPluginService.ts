import { ICandleDataPoint, IChartTypeRegistry, ITradingChart, ITradingChartHookType, ITradingChartItem, ITradingChartPluginService } from 'hk-trading-contract'
import { callCallback, isFunction } from '@hungknow/utils'

export class TradingChartPluginService implements ITradingChartPluginService {

    constructor(protected plugins: ITradingChartItem[]) {}

    _notify<TType extends keyof IChartTypeRegistry, TData>(chart: ITradingChart<TType, TData>, hookId: ITradingChartHookType, args?: any) {
        args = args || {}
        for (const plugin of this.plugins) {
            const method = plugin.hooks[hookId]
            if (isFunction(method)) {
                const params = [chart, args]
                if (callCallback(method, plugin, params) === false && args.cancelable) {
                    return false
                }
            }
        }

        return true
    }

    notify<TType extends keyof IChartTypeRegistry, TData>(chart: ITradingChart<TType, TData>, hookId: ITradingChartHookType, args: any) {
        const result = this._notify(chart, hookId, args)
        if (hookId === 'destroy') {
            // this._notify(chart, 'stop')
        }
        return result
    }

    allPlugins(): ITradingChartItem<keyof IChartTypeRegistry, (ICandleDataPoint | [number, number])[]> {
        throw new Error('Method not implemented.')
    }

}