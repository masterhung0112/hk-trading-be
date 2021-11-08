import { ArrayIterator } from '../../src/iterators/ArrayIterator'

describe('Array Iterator', () => {
    it('iterator for empty array', () => {
        const it = new ArrayIterator([])
        expect(it.next().done).toBeTruthy()
        expect(it.next().done).toBeTruthy()
        expect(it.next().done).toBeTruthy()
    })

    it('iterator for array with 1 elem', () => {
        const it = new ArrayIterator([5])
        expect(it.next()).toEqual({
            done: false,
            value: 5
        })
        expect(it.next().done).toBeTruthy()
        expect(it.next().done).toBeTruthy()
    })
})