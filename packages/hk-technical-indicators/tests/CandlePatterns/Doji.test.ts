import { CandleStickDTO } from 'hk-trading-contract'
import { Doji } from '../../src/CandlePatterns/Doji'

const input: CandleStickDTO[] = [{
    resolutionType: '1m',
    sym: 'test',
    // firstStickSts: 0,
    // lastStickSts: 60 - 9,
    sts: new Date(0, 0, 0, 0, 0, 60 - 9),
    bo: 30.10,
    bh: 32.10,
    bc: 30.13,
    bl: 28.10,
}]

const inputDot: CandleStickDTO[] = [{
    resolutionType: '1m',
    sym: 'test',
    // firstStickSts: 0,
    // lastStickSts: 60 - 9,
    sts: new Date(0, 0, 0, 0, 0, 60 - 9),
    bo: 30.10,
    bh: 30.11,
    bc: 30.10,
    bl: 30.09,
}]

describe('Doji', function () {
    // before(function () {
    //     var imageBuffer = drawCandleStick(input);
    //     fs.writeFileSync(__dirname + '/images/doji.png', imageBuffer);
    // });
    it('Check whether the supplied data has Doji pattern', function () {
        const doji = new Doji()
        const result = doji.hasPattern(input)
        expect(result).toBe(true)
    })
    it('Check whether the supplied data inputDot has Doji pattern', function () {
        const doji = new Doji()
        const result = doji.hasPattern(inputDot)
        expect(result).toBe(true)
    })
    it('Doji when sts is is 4 minutes 59 second', function () {
        const doji = new Doji()
        const result = doji.hasPattern(input.map((i) => ({
            ...i,
            sts: new Date(0, 0, 0, 0, 0, 60 * 5 - 1)
        })))
        expect(result).toBe(true)
    })
    it('Doji when sts is 5 minutes 1 second', function () {
        const doji = new Doji()
        const result = doji.hasPattern(input.map((i) => ({
            ...i,
            sts: new Date(0, 0, 0, 0, 0, 60 * 5 + 1)
        })))
        expect(result).toBe(false)
    })
    it('Doji when sts is 50', function () {
        const doji = new Doji()
        const result = doji.hasPattern(input.map((i) => ({
            ...i,
            sts: new Date(0, 0, 0, 0, 0, 50)
        })))
        expect(result).toBe(true)
    })
})