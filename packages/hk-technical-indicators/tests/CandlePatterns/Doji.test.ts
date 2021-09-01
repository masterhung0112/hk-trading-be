import { CandleMultiStickReversedDto } from '../../src/Models/CandleMultiStickReversedDto'
import { Doji } from '../../src/CandlePatterns/Doji'

const input: CandleMultiStickReversedDto = {
    resolutionType: '1m',
    sym: 'test',
    sts: [123],
    bo: [30.10],
    bh: [32.10],
    bc: [30.13],
    bl: [28.10],
    reversedInput: false,
}

const inputDot: CandleMultiStickReversedDto = {
    resolutionType: '1m',
    sym: 'test',
    sts: [123],
    bo: [30.10],
    bh: [30.11],
    bc: [30.10],
    bl: [30.09],
    reversedInput: false,
}

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
})