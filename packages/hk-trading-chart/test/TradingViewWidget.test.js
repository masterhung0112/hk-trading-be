import { TradingViewWidget } from "../src/TradingViewWidget";
import { mock } from 'jest-mock-extended';
describe('TradingViewWidget', function () {
    it('onReady was called', function () {
        var dataFeedMock = mock();
        var tradingView = new TradingViewWidget({
            containerId: '',
            datafeed: dataFeedMock
        });
    });
});
//# sourceMappingURL=TradingViewWidget.test.js.map