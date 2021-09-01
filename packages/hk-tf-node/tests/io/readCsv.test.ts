import { readCsv } from '../../src/io/readCsv'

describe('readCsv', () => {
    it('Read ok', async () => {
        const df = await readCsv('file://data/finance-charts-apple.csv')
        expect(df).toBeTruthy()
        df.head().print()
    })
})