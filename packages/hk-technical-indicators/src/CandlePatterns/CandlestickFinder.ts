import { DataFrame, IDataFrame } from 'hk-pd'
import { CandleStickDTO, resolutionTypeToSeconds } from 'hk-trading-contract'
import { ICandlestickFinder } from './ICandlestickFinder'

export interface CandlestickFinderArgs {
    id: string
    name: string
    requiredBarNum: number
    ignoreTimestamp?: boolean
}

export class CandlestickFinder implements ICandlestickFinder {
    
    constructor(protected clsArgs: CandlestickFinderArgs) {
        // if (new.target === Abstract) {
        //     throw new TypeError("Abstract class");
        // }
    }

    get id() { return this.clsArgs.id }
    get name() { return this.clsArgs.id }
    get requiredBarNum() { return this.clsArgs.requiredBarNum }

    isTimeApplicable(data: CandleStickDTO[]): boolean {
        if (!this.clsArgs.ignoreTimestamp) {
            if (data.length === 0) {
                return false
            }
            const resolutionSecond = resolutionTypeToSeconds(data[0].resolutionType)
            // const remainingFirst = Math.abs(resolutionSecond - data.sts[0]) 
            const lastDataSeconds = data[data.length - 1].sts.getSeconds()
            const remainingLast = resolutionSecond - (lastDataSeconds % resolutionSecond) // resolutionSecond - (data[data.length - 1].sts % resolutionSecond)
            // console.log('remainingLast', new Date(data.lastStickSts), remainingLast)
            // Only accept the tick of last 10 seconds
            // if (!(remainingFirst < 10 || remainingLast < 10)) {
            if (remainingLast > 10) {
                return false
            }
        }
        // console.log('t OK', new Date(data.lastStickSts))
        return true
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    logic(data: CandleStickDTO[]): boolean {
        throw 'this has to be implemented'
    }

    getAllPatternIndex(data: CandleStickDTO[]) {
        if (data.length < this.clsArgs.requiredBarNum) {
            console.warn('Data count less than data required for the strategy ', this.clsArgs.name)
            return []
        }
        // if (data.reversedInput) {
        //     data.bo.reverse()
        //     data.bh.reverse()
        //     data.bl.reverse()
        //     data.bl.reverse()
        // }
        const strategyFn = this.logic
        return this._generateDataForCandleStick(data)
            .select((current, index) => {
                return strategyFn.call(this, current) ? index : undefined
            }).where((hasIndex) => {
                return !!hasIndex
            })
    }

    // Get only the last items from array and check if it has the corresponding pattern
    hasPattern(data: CandleStickDTO[]): boolean {
        if (data.length < this.clsArgs.requiredBarNum) {
            console.warn('Data count less than data required for the strategy ', this.clsArgs.name)
            return false
        }

        const isTimeOK = this.isTimeApplicable(data)
        if (!isTimeOK) { 
            return false
        }

        // if (data.reversedInput) {
        //     data.bo.reverse()
        //     data.bh.reverse()
        //     data.bl.reverse()
        //     data.bc.reverse()
        // }
        const strategyFn = this.logic
        return strategyFn.call(this, this._getLastDataForCandleStick(data))
    }

    protected _getLastDataForCandleStick(data: CandleStickDTO[]) {
        const requiredCount = this.clsArgs.requiredBarNum
        if (data.length === requiredCount) {
            return data
        } else {
            return data.slice(data.length - requiredCount)
            // const returnVal: CandleStickDTO[] = {
            //     resolutionType: data.resolutionType,
            //     firstStickSts: -1,
            //     lastStickSts: -1,
            //     sym: data.sym,
            //     sts: data.sts,
            //     bo: new Series(),
            //     bh: new Series(),
            //     bl: new Series(),
            //     bc: new Series(),
            //     reversedInput: data.reversedInput
            // }
            // let i = 0
            // const index = data.length - requiredCount
            // while (i < requiredCount) {
            //     // returnVal.firstStickSts = returnVal.firstStickSts < 0 ? data.firstStickSts : Math.min(data.firstStickSts, returnVal.firstStickSts)
            //     // returnVal.lastStickSts = returnVal.lastStickSts < 0 ? data.lastStickSts : Math.max(data.lastStickSts, returnVal.lastStickSts)
            //     returnVal.bo = returnVal.bo.concat(data.bo[index + i])
            //     returnVal.bh = returnVal.bh.concat(data.bh[index + i])
            //     returnVal.bl = returnVal.bl.concat(data.bl[index + i])
            //     returnVal.bc = returnVal.bc.concat(data.bc[index + i])
            //     i++
            // }
            // return returnVal
        }
    }

    protected _generateDataForCandleStick(data: CandleStickDTO[]): IDataFrame<number, CandleStickDTO> {
        const requiredCount = this.clsArgs.requiredBarNum
        const generatedData = new DataFrame<number, CandleStickDTO>(data).take(requiredCount)
        return generatedData
    }
}