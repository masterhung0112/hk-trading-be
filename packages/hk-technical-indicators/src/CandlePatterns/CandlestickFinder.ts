import { CandleMultiStickReversedDto } from '../Models/CandleMultiStickReversedDto'
import { resolutionTypeToSecond } from '../Utils'
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
            const resolutionSecond = resolutionTypeToSecond(data.resolutionType)
            const remainingFirst = Math.abs(resolutionSecond - data.sts[0]) 
            const remainingLast = Math.abs(data.sts[0] - resolutionSecond)
            // Only accept the tick of last 10 seconds
            if (!(remainingFirst < 10 || remainingLast < 10)) {
                return false
            }
        }
        return true
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    logic(data: CandleMultiStickReversedDto): boolean {
        throw 'this has to be implemented'
    }

    getAllPatternIndex(data: CandleMultiStickReversedDto) {
        if (data.bc.length < this.clsArgs.requiredBarNum) {
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
            .map((current, index) => {
                return strategyFn.call(this, current) ? index : undefined
            }).filter((hasIndex) => {
                return hasIndex
            })
    }

    // Get only the last items from array and check if it has the corresponding pattern
    hasPattern(data: CandleMultiStickReversedDto): boolean {
        if (data.bc.length < this.clsArgs.requiredBarNum) {
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
        if (data.bc.length === requiredCount) {
            return data
        } else {
            const returnVal: CandleMultiStickReversedDto = {
                resolutionType: data.resolutionType,
                sym: data.sym,
                sts: data.sts,
                bo: [],
                bh: [],
                bl: [],
                bc: [],
                reversedInput: data.reversedInput
            }
            let i = 0
            const index = data.bc.length - requiredCount
            while (i < requiredCount) {
                returnVal.bo.push(data.bo[index + i])
                returnVal.bh.push(data.bh[index + i])
                returnVal.bl.push(data.bl[index + i])
                returnVal.bc.push(data.bc[index + i])
                i++
            }
            return returnVal
        }
    }

    protected _generateDataForCandleStick(data: CandleMultiStickReversedDto) {
        const requiredCount = this.clsArgs.requiredBarNum
        const generatedData = data.bc.map(function (currentData, index) {
            let i = 0
            const returnVal: CandleMultiStickReversedDto = {
                resolutionType: data.resolutionType,
                sym: data.sym,
                sts: data.sts,
                bo: [],
                bh: [],
                bl: [],
                bc: [],
                reversedInput: data.reversedInput
            } 
            while (i < requiredCount) {
                returnVal.bo.push(data.bo[index + i])
                returnVal.bh.push(data.bh[index + i])
                returnVal.bl.push(data.bl[index + i])
                returnVal.bc.push(data.bc[index + i])
                i++
            }
            return returnVal
        }).filter((val, index) => { return (index <= (data.bc.length - requiredCount)) })
        return generatedData
    }
}