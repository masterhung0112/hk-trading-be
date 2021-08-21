import { benchmark } from "../Utils/fakeUtils"
import { approach4ObservableBuffer } from "./approach4ObservableBuffer"

jest.setTimeout(120000)

describe('approach4ObservableBuffer', () => {
    it('approach4ObservableBuffer', async () => {
        await benchmark('approach4ObservableBuffer', approach4ObservableBuffer, 1)
    })
})