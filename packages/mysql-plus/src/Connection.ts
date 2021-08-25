import { Connection as InternalConnection, QueryOptions, OkPacket, RowDataPacket, ResultSetHeader, PoolOptions as PoolOptionsInternal } from 'mysql2'
// import InternalConnection from 'mysql2/lib/connection'

export type QueryResult = Promise<RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ValuesType = any | any[] | { [param: string]: any }
declare module 'mysql2' {

    // type QueryResult = Promise<OkPacket>
    interface PQueryFunction {
        /*
            Without callback
        */
        (query: string): QueryResult
        (query: string, values: ValuesType): QueryResult
        (options: QueryOptions): QueryResult
        (options: QueryOptions, values: ValuesType): QueryResult
    }

    // Extends existing Connection interface
    interface Connection {
        pquery: PQueryFunction
    }
    class Connection {}

    class Pool {
        constructor(c: {config: PoolOptionsInternal}) 
      }

    class PoolOptions {}
}

/*
 * The same as the `query` method except when not passed a callback it returns
 * a promise that resolves with the results of the query.
 * 
 * @example
 * connection.pquery('SELECT * FROM `books` WHERE `author` = "David"')
 *   .then((results) => {
 *     // results will contain the results of the query
 *   })
 *   .catch((error) => {
 *     // error will be the Error that occurred during the query
 *   });
 */
InternalConnection.prototype.pquery = (sql, values?): QueryResult => {
    // if (typeof (values || sql) === 'function') {
    //     return (this as InternalConnection).query(sql, values, cb)
    // }

    return new Promise((resolve, reject) => {
        (this as InternalConnection).query(sql, values, (error, results) => {
            if (error) {
                reject(error)
            } else {
                resolve(results)
            }
        })
    })
}
