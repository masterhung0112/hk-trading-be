import StockData from "../StockData";

export class CandlestickFinder {
    
    constructor(public name: string, public requiredCount: number) {
        // if (new.target === Abstract) {
        //     throw new TypeError("Abstract class");
        // }
    }

    logic(data: StockData): boolean {
        throw "this has to be implemented";
    }

    getAllPatternIndex(data: StockData) {
        if (data.close.length < this.requiredCount) {
            console.warn('Data count less than data required for the strategy ', this.name);
            return [];
        }
        if (data.reversedInput) {
            data.open.reverse();
            data.high.reverse();
            data.low.reverse();
            data.close.reverse();
        }
        let strategyFn = this.logic;
        return this._generateDataForCandleStick(data)
            .map((current, index) => {
                return strategyFn.call(this, current) ? index : undefined;
            }).filter((hasIndex) => {
                return hasIndex;
            });
    }

    hasPattern(data: StockData) {
        if (data.close.length < this.requiredCount) {
            console.warn('Data count less than data required for the strategy ', this.name);
            return false;
        }
        if (data.reversedInput) {
            data.open.reverse();
            data.high.reverse();
            data.low.reverse();
            data.close.reverse();
        }
        let strategyFn = this.logic;
        return strategyFn.call(this, this._getLastDataForCandleStick(data));
    }

    protected _getLastDataForCandleStick(data: StockData) {
        let requiredCount = this.requiredCount;
        if (data.close.length === requiredCount) {
            return data;
        } else {
            let returnVal: StockData = {
                open: [],
                high: [],
                low: [],
                close: []
            }
            let i = 0;
            let index = data.close.length - requiredCount;
            while (i < requiredCount) {
                returnVal.open.push(data.open[index + i]);
                returnVal.high.push(data.high[index + i]);
                returnVal.low.push(data.low[index + i]);
                returnVal.close.push(data.close[index + i]);
                i++;
            }
            return returnVal;
        }
    }

    protected _generateDataForCandleStick(data: StockData) {
        let requiredCount = this.requiredCount;
        let generatedData = data.close.map(function (currentData, index) {
            let i = 0;
            let returnVal = {
                open: [],
                high: [],
                low: [],
                close: []
            } as StockData;
            while (i < requiredCount) {
                returnVal.open.push(data.open[index + i]);
                returnVal.high.push(data.high[index + i]);
                returnVal.low.push(data.low[index + i]);
                returnVal.close.push(data.close[index + i]);
                i++;
            }
            return returnVal;
        }).filter((val, index) => { return (index <= (data.close.length - requiredCount)) });
        return generatedData;
    }
}