import { benchmark } from "../Utils/fakeUtils"
import { approach3Observable } from "./approach3Observable"

jest.setTimeout(120000)

describe('approach3Observable', () => {
    it('approach3Observable', async () => {
        await benchmark('approach3Observable', approach3Observable, 1)
    })
})