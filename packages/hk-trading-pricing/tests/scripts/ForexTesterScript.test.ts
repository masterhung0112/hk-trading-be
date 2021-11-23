import path from 'path'
import mysql from 'mysql2/promise'

import { tryReadCsv, writetoDB } from '../../src/scripts/ForexTesterScript'
import { SqlForexCandleStore } from '../../src/Stores/SqlForexCandleStore'

jest.setTimeout(120000)

describe('ForexTesterScript', () => {
    it('tryreadcsv OK', async () => {
        const csvPath = path.resolve(__dirname, '../data/small.txt')

        await tryReadCsv(csvPath)
    })

    it('writeDB OK', async () => {
        const mysqlPool = mysql.createPool({
            host: process.env.MYSQL_HOST,
            port: parseInt(process.env.MYSQL_PORT),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASS,
            database: process.env.MYSQL_DB,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
          })

        const csvPath = path.resolve(__dirname, '../data/ForexTester_XAUUSD.txt')
        const candleWriteStore = new SqlForexCandleStore(mysqlPool)
        candleWriteStore.init()

        await writetoDB(csvPath, candleWriteStore, candleWriteStore)
    })
})
