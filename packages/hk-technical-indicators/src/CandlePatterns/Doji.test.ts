import { Doji } from "./Doji";

var input = {
    open: [30.10],
    high: [32.10],
    close: [30.13],
    low: [28.10],

}

var inputDot = {
    open: [30.10],
    high: [30.11],
    close: [30.10],
    low: [30.09],
}

describe('Doji', function () {
    // before(function () {
    //     var imageBuffer = drawCandleStick(input);
    //     fs.writeFileSync(__dirname + '/images/doji.png', imageBuffer);
    // });
    it('Check whether the supplied data has Doji pattern', function () {
        var doji = new Doji();
        var result = doji.hasPattern(input);
        expect(result).toBe(true)
    });
    it('Check whether the supplied data has Doji pattern', function () {
        var doji = new Doji();
        var result = doji.hasPattern(inputDot);
        expect(result).toBe(true)
    });
})