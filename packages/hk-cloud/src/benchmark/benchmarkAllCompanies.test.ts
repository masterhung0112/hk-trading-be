import { benchmarkAllCompanies } from "./benchmarkAllCompanies"

jest.setTimeout(120000)

describe('benchmarkAllCompanies', () => {
    it('benchmarkAllCompanies', async () => {
        await benchmarkAllCompanies()
    })
})