import { IndicatorInput } from '../indicator/indicator'

export class MAInput extends IndicatorInput {
    constructor(public period:number, 
                public values:number[]) {
        super()
    }
}