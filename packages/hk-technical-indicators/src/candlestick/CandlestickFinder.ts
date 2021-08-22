import StockData from '../StockData'

export class CandlestickFinder {
    
    constructor(public name: string, public requiredCount: number) {
        // if (new.target === Abstract) {
        //     throw new TypeError("Abstract class");
        // }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    logic(data: StockData): boolean {
        throw 'this has to be implemented'
    }

    getAllPatternIndex(data: StockData) {
        if (data.close.length < this.requiredCount) {
            console.warn('Data count less than data required for the strategy ', this.name)
            return []
        }
        if (data.reversedInput) {
            data.open.reverse()
            data.high.reverse()
            data.low.reverse()
            data.close.reverse()
        }
        const strategyFn = this.logic
        return this._generateDataForCandleStick(data)
            .map((current, index) => {
                return strategyFn.call(this, current) ? index : undefined
            }).filter((hasIndex) => {
                return hasIndex
            })
    }

    // Get only the last items from array and check if it has the corresponding pattern
    hasPattern(data: StockData) {
        if (data.close.length < this.requiredCount) {
            console.warn('Data count less than data required for the strategy ', this.name)
            return false
        }
        if (data.reversedInput) {
            data.open.reverse()
            data.high.reverse()
            data.low.reverse()
            data.close.reverse()
        }
        const strategyFn = this.logic
        return strategyFn.call(this, this._getLastDataForCandleStick(data))
    }

    protected _getLastDataForCandleStick(data: StockData) {
        const requiredCount = this.requiredCount
        if (data.close.length === requiredCount) {
            return data
        } else {
            const returnVal: StockData = {
                open: [],
                high: [],
                low: [],
                close: []
            }
            let i = 0
            const index = data.close.length - requiredCount
            while (i < requiredCount) {
                returnVal.open.push(data.open[index + i])
                returnVal.high.push(data.high[index + i])
                returnVal.low.push(data.low[index + i])
                returnVal.close.push(data.close[index + i])
                i++
            }
            return returnVal
        }
    }

    protected _generateDataForCandleStick(data: StockData) {
        const requiredCount = this.requiredCount
        const generatedData = data.close.map(function (currentData, index) {
            let i = 0
            const returnVal = {
                open: [],
                high: [],
                low: [],
                close: []
            } as StockData
            while (i < requiredCount) {
                returnVal.open.push(data.open[index + i])
                returnVal.high.push(data.high[index + i])
                returnVal.low.push(data.low[index + i])
                returnVal.close.push(data.close[index + i])
                i++
            }
            return returnVal
        }).filter((val, index) => { return (index <= (data.close.length - requiredCount)) })
        return generatedData
    }
}