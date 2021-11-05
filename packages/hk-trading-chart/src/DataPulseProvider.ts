import { ResolutionType, resolutionTypeToSeconds } from 'hk-trading-contract'
import { CandleProvider } from './CandleProvider'

export class DataPulseProvider {
    subscribers: Map<string, (listenerGuid: string) => VideoFacingModeEnum>
    protected requestsPending = 0

    constructor(protected historyProvider: CandleProvider, updateFrequency: number) {
        setInterval(this.updateData.bind(this), updateFrequency)
    }

    protected updateData() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this
        if (this.requestsPending > 0) {
            return
        }
        this.requestsPending = 0
        const loop1 = function (listenerGuid) {
            self.requestsPending += 1
            self.updateDataForSubscriber(listenerGuid)
                .then(function () {
                    self.requestsPending -= 1
                // logMessage('DataPulseProvider: data for #' + listenerGuid + ' updated successfully, pending=' + _this._requestsPending)
            })
                .catch(function () {
                    self.requestsPending -= 1
                // logMessage('DataPulseProvider: data for #' + listenerGuid + ' updated with error=' + getErrorMessage(reason) + ', pending=' + _this._requestsPending)
            })
        }
        for (const listenerGuid in this.subscribers) {
            loop1(listenerGuid)
        }
    }

    protected onSubscriberDataReceived(listenerGuid, result) {
        // means the subscription was cancelled while waiting for data
        if (!this.subscribers.hasOwnProperty(listenerGuid)) {
            // logMessage("DataPulseProvider: Data comes for already unsubscribed subscription #" + listenerGuid);
            return
        }
        const bars = result.bars
        if (bars.length === 0) {
            return
        }
        const lastBar = bars[bars.length - 1]
        const subscriptionRecord = this.subscribers[listenerGuid]
        if (subscriptionRecord.lastBarTime !== null && lastBar.time < subscriptionRecord.lastBarTime) {
            return
        }
        const isNewBar = subscriptionRecord.lastBarTime !== null && lastBar.time > subscriptionRecord.lastBarTime
        // Pulse updating may miss some trades data (ie, if pulse period = 10 secods and new bar is started 5 seconds later after the last update, the
        // old bar's last 5 seconds trades will be lost). Thus, at fist we should broadcast old bar updates when it's ready.
        if (isNewBar) {
            if (bars.length < 2) {
                throw new Error('Not enough bars in history for proper pulse update. Need at least 2.')
            }
            const previousBar = bars[bars.length - 2]
            subscriptionRecord.listener(previousBar)
        }
        subscriptionRecord.lastBarTime = lastBar.time
        subscriptionRecord.listener(lastBar)
    }

    protected updateDataForSubscriber(listenerGuid: string) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this
        const subscriptionRecord = this.subscribers[listenerGuid]
        const rangeEndTime = parseInt((Date.now() / 1000).toString())
        // BEWARE: please note we really need 2 bars, not the only last one
        // see the explanation below. `10` is the `large enough` value to work around holidays
        const rangeStartTime = rangeEndTime - resolutionTypeToSeconds(subscriptionRecord.resolution, 10)
        return this.historyProvider.getBars(subscriptionRecord.symbolInfo, subscriptionRecord.resolution, rangeStartTime, rangeEndTime)
            .then(function (result) {
                self.onSubscriberDataReceived(listenerGuid, result)
        })
    }

    subscribeBars(symbolInfo: string, resolution: ResolutionType, newDataCallback: () => void, listenerGuid: string) {
        if (this.subscribers.hasOwnProperty(listenerGuid)) {
            // logMessage("DataPulseProvider: already has subscriber with id=" + listenerGuid);
            return
        }
        this.subscribers[listenerGuid] = {
            lastBarTime: null,
            listener: newDataCallback,
            resolution: resolution,
            symbolInfo: symbolInfo,
        }
    }

    unsubscribeBars(listenerGuid: string) {
        delete this.subscribers[listenerGuid]
        // logMessage("DataPulseProvider: unsubscribed for #" + listenerGuid);
    }
}