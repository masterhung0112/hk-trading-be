import { ColumnsToArraysIterator } from '../../src/iterators/ColumnsToArraysIterator'

describe('ColumnsToArraysIterator', () => {
    it('return array of each columns for each iterator', () => {
        const it = new ColumnsToArraysIterator(['v1', 'v2'], [{
            v1: 1,
            v2: 2,
            v3: 3
        }, {
            v1: 4,
            v2: 5,
            v3: 6,
        }])
        expect(it.next().value).toEqual([1, 4])
        expect(it.next().value).toEqual([2, 5])
        expect(it.next().done).toBeTruthy()
    })
})