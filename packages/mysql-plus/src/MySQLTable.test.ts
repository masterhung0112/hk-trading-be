import { MySQLPlus } from './MySQLPlus'
import { MySQLTable } from './MySQLTable'
import { PoolPlusConfig } from './PoolPlus'

const config: PoolPlusConfig = {

}

describe('MySQLTable', () => {

    const pool = MySQLPlus.createPool(config)
    const mockTableSchema = {}
    const testTable = new MySQLTable('mysql_table_test_table', mockTableSchema, pool)

    before((done) => {
        pool.query(`
          CREATE TABLE \`mysql_table_test_table\` (
            \`id\` BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
            \`email\` VARCHAR(255) NOT NULL UNIQUE,
            \`letter\` CHAR(1)
          )
        `, done)
    })

    after((done) => {
        pool.end(done)
    })


    describe('insert', () => {
        describe('with a promise', () => {
            it('should insert the specified data into the table', () => {
                return testTable.insert({ email: 'one@email.com' })
                    .then((result) => {
                        result.affectedRows.should.equal(1)
                        result.insertId.should.equal(1)
                    })
            })
        })
    })
})