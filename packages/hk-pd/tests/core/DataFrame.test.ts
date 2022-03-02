/* eslint-disable @typescript-eslint/naming-convention */
import { DataFrame } from '../../src/core/DataFrame'

describe('DataFrame', () => {
    it('can bake dataframe', () => {
		const dataframe = new DataFrame({
            values: [10, 20],
            index: [1, 2],
        })
		const baked = dataframe.bake()

		expect(baked).not.toBe(dataframe)
	})

    it('baking a baked dataframe returns same', () => {
		const dataframe = new DataFrame({
            values: [10, 20],
            index: [1, 2],
        })
        const baked = dataframe.bake()
        const rebaked = baked.bake()

		expect(rebaked).toBe(baked)
    })

    it('can rewrite dataframe with select', () => {
        const dataFrame = new DataFrame([
            {
                A: 1,
                B: 10,
            },
            {
                A: 2,
                B: 20,
            }
        ])

        const modified = dataFrame.select(v => ({ A: v.A * 2, B: v.B * 2 }))
        expect(modified.toArray()).toEqual([
            {
                A: 2,
                B: 20,
            },
            {
                A: 4,
                B: 40,
            }
        ])
    })

    it('using select on a dataframe redefines the columns', () => {
		const df = new DataFrame([
            { A: 1, B: 10 },
            { A: 2, B: 20 },
        ])

		const modified = df.select(row => ({ X: row.A, Y: row.B }))
		expect(df.getColumnNames()).toEqual(['A', 'B'])
		expect(modified.getColumnNames()).toEqual(['X', 'Y'])
    })

    it('can generate series - function version', () => {

		const df = new DataFrame({
                columnNames: ['Column1', 'Column2'], 
                rows: [
					[1, 10],
					[2, 20],
					[3, 30],
				],
				index: [10, 11, 12]
            })

		const modified = df.generateSeries(row => ({
                NewColumn: row.Column1 + row.Column2,
			}))

		expect(df.getColumnNames()).toEqual(['Column1', 'Column2'])
		expect(modified.getColumnNames()).toEqual(['Column1', 'Column2', 'NewColumn'])
		expect(modified.getSeries('NewColumn').toArray()).toEqual([11, 22, 33])
	})

	it('can generate series - object version', () => {

		const df = new DataFrame({
                columnNames: ['Column1', 'Column2'], 
                rows: [
                    [1, 10],
                    [2, 20],
                    [3, 30],
                ],
                index:[10, 11, 12]
            })

		const modified = df.generateSeries({
				NewColumn: row => row.Column1 + row.Column2
			})
			
		expect(df.getColumnNames()).toEqual(['Column1', 'Column2'])
		expect(modified.getColumnNames()).toEqual(['Column1', 'Column2', 'NewColumn'])
		expect(modified.getSeries('NewColumn').toArray()).toEqual([11, 22, 33])
    })    
    
	it('can generate series - function with static values', () => {

		const df = new DataFrame({
                columnNames: ['Column1', 'Column2'], 
                rows: [
					[1, 10],
					[2, 20],
					[3, 30],
				],
				index: [10, 11, 12]
            })

		const modified = df.generateSeries(row => ({
                NewColumn: 22,
			}))

        expect(df.getColumnNames()).toEqual(['Column1', 'Column2'])
		expect(modified.getColumnNames()).toEqual(['Column1', 'Column2', 'NewColumn'])
		expect(modified.getSeries('NewColumn').toArray()).toEqual([22, 22, 22])
	})
    

	it('can generate series - object with static values', () => {

		const df = new DataFrame({
                columnNames: ['Column1', 'Column2'], 
                rows: [
                    [1, 10],
                    [2, 20],
                    [3, 30],
                ],
                index:[10, 11, 12]
            })

		const modified = df.generateSeries({
				NewColumn: () => 5,
			}) 
			
		expect(df.getColumnNames()).toEqual(['Column1', 'Column2'])
		expect(modified.getColumnNames()).toEqual(['Column1', 'Column2', 'NewColumn'])
		expect(modified.getSeries('NewColumn').toArray()).toEqual([5, 5, 5])
	})    
})