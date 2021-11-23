import { tryReadCsv } from '../src/scripts/FxcmScript'

describe('Read csv', () => {
    it('tryreadcsv OK', async () => {
        await tryReadCsv()
    })
})
