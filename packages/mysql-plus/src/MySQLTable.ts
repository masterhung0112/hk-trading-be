import { Connection, OkPacket } from 'mysql2'
import './Connection'

/**
 * A class that provides convenient methods for performing queries.<br>To create
 * an instance, use {@link PoolPlus#defineTable|`poolPlus.defineTable()`} or
 * {@link PoolPlus#basicTable|`poolPlus.basicTable()`}.
 */
export class MySQLTable {
    schema: any
    pool: any

    protected _db: Connection
    protected _escapedName: string

    constructor(name: string, schema, pool, trxn?) {
        this.schema = schema
        this.pool = pool
        this._db = trxn || pool
        this._escapedName = this._db.escapeId(name)
    }

    select(columns: string | string[], sqlString: string, values: any) {
        if (typeof columns !== 'string') {
            columns = columns.map((col) => this._db.escapeId(col))
        }

        if (typeof sqlString === 'function') {
            values = sqlString
            sqlString = ''
        }

        return this._db.pquery(
            `SELECT ${columns} FROM ${this._escapedName} ${sqlString}`,
            values,
        )
    }

    /* @example <caption>Insert a new user</caption>
     * userTable.insert({email: 'email@example.com', name: 'John Doe'})
     *   .then(result => result.affectedRows); // 1
     *
     * // INSERT INTO `user`
     * // SET `email` = 'email@example.com', `name` = 'John Doe';
     *
     * @example <caption>Insert or update</caption>
     * const data = {id: 5, points: 100};
     * // If duplicate key (id), add the points
     * const onDuplicateKeySQL = 'ON DUPLICATE KEY UPDATE `points` = `points` + ?';
     * userTable.insert(data, onDuplicateKeySQL, [data.points])
     *   .then(result => result.affectedRows); // 1 if inserted, 2 if updated
     *
     * // INSERT INTO `user` SET `id` = 5, `points` = 100
     * // ON DUPLICATE KEY UPDATE `points` = `points` + 100;
     *
     * @example <caption>With only the `sqlString` argument</caption>
     * placeTable.insert('SET `location` = POINT(0, 0)');
     * // INSERT INTO `place` SET `location` = POINT(0, 0);
     *
     * placeTable.insert('(`location`) VALUES (POINT(?, ?))', [8, 2]);
     * // INSERT INTO `place` (`location`) VALUES (POINT(8, 2));
     *
     * @example <caption>Bulk insert</caption>
     * const users = [
     *   [1, 'john@email.com', 'John Doe'],
     *   [2, 'jane@email.com', 'Jane Brown'],
     * ];
     * userTable.insert([users])
     *   .then(result => result.insertId); // 2 (ID of the last inserted row)
     *
     * // INSERT INTO `user` VALUES
     * // (1, 'john@email.com', 'John Doe'),
     * // (2, 'jane@email.com', 'Jane Brown');
     *
     * @example <caption>Bulk insert with specified columns</caption>
     * const users = [
     *   ['john@email.com', 'John Doe'],
     *   ['jane@email.com', 'Jane Brown'],
     * ];
     * userTable.insert([['email', 'name'], users])
     *   .then(result => result.affectedRows); // 2
     *
     * // INSERT INTO `user` (`email`, `name`) VALUES
     * // ('john@email.com', 'John Doe'),
     * // ('jane@email.com', 'Jane Brown');
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    insert(data: string | Record<string | number, any> | string[], sqlString?: string, values?: any | any[]): Promise<OkPacket> {
        // insert('SET `location` = POINT(0, 0)')
        if (typeof data === 'string') {
            return this._db.pquery(
                `INSERT INTO  ${this._escapedName}${data} ${sqlString}`,
                values
            )
        }

        // insert({id: 5, points: 100}, 'ON DUPLICATE KEY UPDATE `points` = `points` + ?', [data.points])
        if (typeof sqlString === 'string') {
            if (typeof values === 'object') {
                sqlString = this._db.format(sqlString, values)
            } else if (Array.isArray(values) || typeof values === 'undefined') {

            } else {
                throw new Error(`unknown type for values, type: ${typeof(values)}, value ${values}`)    
            }
        } else if (typeof sqlString === 'undefined') {
            // No need to process
        } else {
            throw new Error(`unknown type for sqlString, type: ${typeof(sqlString)}, value ${sqlString}`)
        }

        sqlString = sqlString || ''

        /*
        * const users = [
        *   [1, 'john@email.com', 'John Doe'],
        *   [2, 'jane@email.com', 'Jane Brown'],
        * ];
        * insert([users])
        * 
        * const users = [
        *   ['john@email.com', 'John Doe'],
        *   ['jane@email.com', 'Jane Brown'],
        * ];
        * userTable.insert([['email', 'name'], users])
        */
        if (Array.isArray(data)) {
            data = data.length > 1
                ? ' (' + this._db.escapeId(data[0]) + ') VALUES ' + this._db.escape(data[1])
                : ' VALUES ' + this._db.escape(data[0])

            return this._db.pquery(
                `INSERT INTO ${this._escapedName}${data} ${sqlString}`,
                values
            )
        }

        // insert({email: 'email@example.com', name: 'John Doe'})
        //
        // INSERT INTO `user`
        // SET `email` = 'email@example.com', `name` = 'John Doe';
        return this._db.pquery(
            `INSERT INTO ${this._escapedName} SET ${this._db.escape(data)} ${sqlString}`,
            values
        )
    }

    delete(sqlString, values?: any | any[]) {
        if (sqlString === undefined || typeof sqlString === 'function') {
          values = sqlString
          sqlString = ''
        }
        return this._db.pquery(
          'DELETE FROM ' + this._escapedName + ' ' + sqlString,
          values
        )
      }
}