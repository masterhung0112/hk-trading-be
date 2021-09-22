import { timeBenchmark } from '../src/benchmark'
import { DataFrame } from '../src/core'

test('runbench', () => {
    const result = timeBenchmark(function () {
        new DataFrame(new Array(10000).fill({'col1': 22, 'col2': 'col2value'}))
    }, 100)
    console.log(result)
})