import { MySQLPlus } from '../src/MySQLPlus'
import { MySQLTable } from '../src/MySQLTable'
import { PoolPlusConfig } from '../src/PoolPlus'

const config: PoolPlusConfig = {
    host: 'localhost',
    user: 'hkuser',
    password: 'mostest',
    database: 'mysqlplustest'
}

describe('MySQLTable', () => {

    const pool = MySQLPlus.createPool(config)
    const mockTableSchema = {}
    const testTable = new MySQLTable('mysql_table_test_table', mockTableSchema, pool)

    function resetTable() {
        testTable.delete((err) => {
            if (err) throw err
            pool.query('ALTER TABLE `mysql_table_test_table` AUTO_INCREMENT=1')
        })
    }


    beforeAll(async () => {
        try {
            await pool.pquery(`
          CREATE TABLE IF NOT EXISTS \`mysql_table_test_table\` (
            \`id\` BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
            \`email\` VARCHAR(255) NOT NULL UNIQUE,
            \`letter\` CHAR(1)
          )
        `)
        } finally {
            // done()
        }
    })

    // afterEach((done) => {
    // pool.end(done)
    // })

    describe('insert', () => {
        afterAll(resetTable)

        it('should insert the specified data into the table', () => {
            return testTable.insert({ email: 'one@email.com' })
                .then((result) => {
                    expect(result.affectedRows).toEqual(1)
                    expect(result.insertId).toEqual(1)
                })
        })

        it('should insert the specified data into the table with an ON DUPLICATE KEY UPDATE clause', () => {
            const data = { id: 1, email: 'one@email.com' }
            const columns = Object.keys(data)
            const rows = [
                [data[columns[0]], data[columns[1]]],
            ]
            const onDuplicateKey1 = 'ON DUPLICATE KEY UPDATE `email` = \'one2@email.com\''
            const onDuplicateKey2 = 'ON DUPLICATE KEY UPDATE `email` = \'one2b@email.com\''

            return Promise.all([
                testTable.insert(data, onDuplicateKey1),
                testTable.insert([columns, rows], onDuplicateKey2),
            ]).then((results) => {
                expect(results[0].affectedRows).toEqual(2) // Updated rows are affected twice
                expect(results[0].insertId).toEqual(1)
                expect(results[1].affectedRows).toEqual(2)
                expect(results[1].insertId).toEqual(1)
            })
        })

    })
})