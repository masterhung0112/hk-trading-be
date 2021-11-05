import { IndicatorInput } from '../indicator/Indicator'

export class MAInput extends IndicatorInput {
    constructor(public period:number, 
                public values:number[]) {
        super()
    }
}