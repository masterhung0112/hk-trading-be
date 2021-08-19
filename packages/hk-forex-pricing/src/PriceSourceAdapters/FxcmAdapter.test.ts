import { FxcmAdapter } from "./FxcmAdapter"

jest.setTimeout(30000)

describe('FxcmAdapter', () => {
    it('FxcmAdapter run OK', async () => {
        await new Promise(res => setTimeout(() => {
            const adapter = new FxcmAdapter()
            adapter.authenticate()

            setTimeout(() => {
                adapter.subscribe({ "pairs": "EUR/USD" })
            }, 5000)
        }, 30000))
    })
})