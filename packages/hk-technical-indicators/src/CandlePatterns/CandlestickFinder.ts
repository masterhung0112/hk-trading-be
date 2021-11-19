import { Series } from 'hk-pd'
import { resolutionTypeToSeconds } from 'hk-trading-contract'
import { CandleMultiStickReversedDto } from '../Models/CandleMultiStickReversedDto'
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

    isTimeApplicable(data: CandleMultiStickReversedDto): boolean {
        if (!this.clsArgs.ignoreTimestamp) {
            if (data.sts.count() === 0) {
                return false
            }
            const resolutionSecond = resolutionTypeToSeconds(data.resolutionType)
            // const remainingFirst = Math.abs(resolutionSecond - data.sts[0]) 
            const remainingLast = resolutionSecond - (data.lastStickSts % resolutionSecond)
            // console.log('remainingLast', new Date(data.lastStickSts), remainingLast)
            // Only accept the tick of last 10 seconds
            // if (!(remainingFirst < 10 || remainingLast < 10)) {
            if (remainingLast > 10) {
                return false
            }
        }
        console.log('t OK', new Date(data.lastStickSts))
        return true
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    logic(data: CandleMultiStickReversedDto): boolean {
        throw 'this has to be implemented'
    }

    getAllPatternIndex(data: CandleMultiStickReversedDto) {
        if (data.bc.count() < this.clsArgs.requiredBarNum) {
            console.warn('Data count less than data required for the strategy ', this.clsArgs.name)
            return []
        }
        if (data.reversedInput) {
            data.bo.reverse()
            data.bh.reverse()
            data.bl.reverse()
            data.bl.reverse()
        }
        const strategyFn = this.logic
        return this._generateDataForCandleStick(data)
            .select((current, index) => {
                return strategyFn.call(this, current) ? index : undefined
            }).where((hasIndex) => {
                return !!hasIndex
            })
    }

    // Get only the last items from array and check if it has the corresponding pattern
    hasPattern(data: CandleMultiStickReversedDto): boolean {
        if (data.bc.count() < this.clsArgs.requiredBarNum) {
            console.warn('Data count less than data required for the strategy ', this.clsArgs.name)
            return false
        }

        const isTimeOK = this.isTimeApplicable(data)
        if (!isTimeOK) { 
            return false
        }

        if (data.reversedInput) {
            data.bo.reverse()
            data.bh.reverse()
            data.bl.reverse()
            data.bc.reverse()
        }
        const strategyFn = this.logic
        return strategyFn.call(this, this._getLastDataForCandleStick(data))
    }

    protected _getLastDataForCandleStick(data: CandleMultiStickReversedDto) {
        const requiredCount = this.clsArgs.requiredBarNum
        if (data.bc.count() === requiredCount) {
            return data
        } else {
            const returnVal: CandleMultiStickReversedDto = {
                resolutionType: data.resolutionType,
                firstStickSts: -1,
                lastStickSts: -1,
                sym: data.sym,
                sts: data.sts,
                bo: new Series(),
                bh: new Series(),
                bl: new Series(),
                bc: new Series(),
                reversedInput: data.reversedInput
            }
            let i = 0
            const index = data.bc.count() - requiredCount
            while (i < requiredCount) {
                returnVal.firstStickSts = returnVal.firstStickSts < 0 ? data.firstStickSts : Math.min(data.firstStickSts, returnVal.firstStickSts)
                returnVal.lastStickSts = returnVal.lastStickSts < 0 ? data.lastStickSts : Math.max(data.lastStickSts, returnVal.lastStickSts)
                returnVal.bo = returnVal.bo.concat(data.bo[index + i])
                returnVal.bh = returnVal.bh.concat(data.bh[index + i])
                returnVal.bl = returnVal.bl.concat(data.bl[index + i])
                returnVal.bc = returnVal.bc.concat(data.bc[index + i])
                i++
            }
            return returnVal
        }
    }

    protected _generateDataForCandleStick(data: CandleMultiStickReversedDto) {
        const requiredCount = this.clsArgs.requiredBarNum
        const generatedData = data.bc.select(function (currentData, index) {
            let i = 0
            const returnVal: CandleMultiStickReversedDto = {
                resolutionType: data.resolutionType,
                firstStickSts: -1,
                lastStickSts: -1,
                sym: data.sym,
                sts: data.sts,
                bo: new Series<number, number>(),
                bh: new Series<number, number>(),
                bl: new Series<number, number>(),
                bc: new Series<number, number>(),
                reversedInput: data.reversedInput
            } 
            while (i < requiredCount) {
                returnVal.firstStickSts = returnVal.firstStickSts < 0 ? data.firstStickSts : Math.min(data.firstStickSts, returnVal.firstStickSts)
                returnVal.lastStickSts = returnVal.lastStickSts < 0 ? data.lastStickSts : Math.max(data.lastStickSts, returnVal.lastStickSts)
                returnVal.bo = returnVal.bo.concat(data.bo[index + i])
                returnVal.bh = returnVal.bh.concat(data.bh[index + i])
                returnVal.bl = returnVal.bl.concat(data.bl[index + i])
                returnVal.bc = returnVal.bc.concat(data.bc[index + i])
                i++
            }
            return returnVal
        }).take(requiredCount)
        return generatedData
    }
}