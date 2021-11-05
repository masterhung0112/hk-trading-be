import { DataFrame } from '../../src/core/DataFrame'

describe('DataFrame', () => {

    describe('drop', function () {
        it('throw error for wrong row index', function () {
            const data = [[1, 2, 3], [4, 5, 6]]
            const cols = ['A', 'B', 'C']
            const df = new DataFrame(data, { columns: cols })
            expect(function () { df.drop({ columns: [3], axis: 0, inplace: false }) }).toThrowError('No index label found. Axis of 0 must be accompanied by an array of index labels')
        })
        it('throw error for wrong row index', function () {
            const data = [[1, 2, 3], [4, 5, 6]]
            const cols = ['A', 'B', 'C']
            const df = new DataFrame(data, { columns: cols })
            expect(function () { df.drop({ columns: ['D'], axis: 1, inplace: false }) }).toThrowError('column "D" does not exist')
        })

        it('drop a column inplace', function () {
            const data = [[1, 2, 3], [4, 5, 6]]
            const cols = ['A', 'B', 'C']
            const df = new DataFrame(data, { columns: cols })
            df.drop({ columns: ['C', 'B'], axis: 1, inplace: true })
            const column = ['A']
            expect(df.columnNames).toEqual(column)
        })
        it('check if data is updated after column is dropped', function () {
            const data = [[1, 2, 3], [4, 5, 6]]
            const cols = ['A', 'B', 'C']
            const df = new DataFrame(data, { columns: cols })
            df.drop({ columns: ['C'], axis: 1, inplace: true })
            const newData = [[1, 2], [4, 5]]
            expect(df.values).toEqual(newData)
            expect(df.dtypes.length).toEqual(2)

        })

        it('check if data is updated after row is dropped', function () {
            const data = [[1, 2, 3], [4, 5, 6]]
            const cols = ['A', 'B', 'C']
            const df = new DataFrame(data, { columns: cols })
            df.drop({ index: [0], axis: 0, inplace: true })
            const newData = [[4, 5, 6]]
            expect(df.values).toEqual(newData)
        })
        it('check if new dataframe is properly created after column is dropped (not-in-inplace)', function () {
            const data = [[1, 2, 3], [4, 5, 6]]
            const cols = ['A', 'B', 'C']
            const df = new DataFrame(data, { columns: cols })
            const dfDrop = df.drop({ columns: ['C'], axis: 1, inplace: false })

            const expectedData = [[1, 2], [4, 5]]
            const expectedCols = ['A', 'B']
            const expectedDf = new DataFrame(expectedData, { columns: expectedCols })
            expect(dfDrop.values).toEqual(expectedDf.values)
        })
        it('check that the dtype is updated after column drop', function () {
            const data = [[1, 2, 3], [4, 5, 6]]
            const cols = ['A', 'B', 'C']
            const df = new DataFrame(data, { columns: cols })
            df.drop({ columns: ['A'], axis: 1, inplace: true })
            const dtype = ['int32', 'int32']
            expect(df.ctypes.values).toEqual(dtype)
        })
        it('drop row by single string labels', function () {
            const data = [[1, 2, 3], [4, 5, 6], [20, 34, 5]]
            const cols = ['A', 'B', 'C']
            const df = new DataFrame(data, { columns: cols, index: ['a', 'b', 'c'] })
            df.drop({ index: ['a'], axis: 0, inplace: true })
            const newData = [[4, 5, 6], [20, 34, 5]]
            expect(df.values).toEqual(newData)
        })
        it('drop row by two or more string labels', function () {
            const data = [[1, 2, 3], [4, 5, 6], [20, 34, 5], [2, 3.4, 5], [2.0, 340, 5]]
            const cols = ['A', 'B', 'C']
            const df = new DataFrame(data, { columns: cols, index: ['a', 'b', 'c', 'a', 'b'] })
            df.drop({ index: ['a', 'b'], axis: 0, inplace: true })
            const newData = [[20, 34, 5]]
            expect(df.values).toEqual(newData)
        })
    })

    describe('head', function () {
        it('Gets the first n rows in a DataFrame', function () {
            const data = [[1, 2, 3], [4, 5, 6], [20, 30, 40], [39, 89, 78]]
            const cols = ['A', 'B', 'C']
            const df = new DataFrame(data, { columns: cols })
            expect(df.head(2).values).toEqual([[1, 2, 3], [4, 5, 6]])
        })
        it('Return all rows in a DataFrame if row specified is greater than values', function () {
            const data = [[1, 2, 3], [4, 5, 6], [20, 30, 40], [39, 89, 78]]
            const cols = ['A', 'B', 'C']
            const df = new DataFrame(data, { columns: cols })
            expect(df.head(10).values).toEqual(data)
        })
        it('Return all rows in a DataFrame if row specified is less than 0', function () {
            const data = [[1, 2, 3], [4, 5, 6], [20, 30, 40], [39, 89, 78]]
            const cols = ['A', 'B', 'C']
            const df = new DataFrame(data, { columns: cols })
            expect(df.head(-1).values).toEqual(data)
        })
    })
})