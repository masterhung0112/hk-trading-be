import * as tf from '@tensorflow/tfjs-node'

describe('simpletf', () => {
    it('multiply', () => {
        tf.tensor1d([10, 20]).mul(20).print()
    })

})