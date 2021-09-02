import { SqlForexQuoteStore } from '../../src/Stores/SqlForexQuoteStore'

describe('SqlForexQuoteStore', () => {
  const store = new SqlForexQuoteStore()
  store.init()

  it('save tick OK', () => {
    // store.saveTick()
  })
})
