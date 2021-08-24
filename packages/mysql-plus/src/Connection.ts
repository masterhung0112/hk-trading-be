import { Connection, Query, QueryOptions, OkPacket, RowDataPacket, ResultSetHeader } from 'mysql2'
import InternalConnection from 'mysql2/lib/connection'

declare module 'mysql2' {
    // type QueryResult = Promise<RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader>
    type QueryResult = Promise<OkPacket>
    export interface PQueryFunction {
        /*
            Without callback
        */
        (query: string | Query): QueryResult
        (options: string | QueryOptions, values: any | any[]): QueryResult
    }

    // Extends existing Connection interface
    interface Connection {
        pquery: PQueryFunction
    }
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
InternalConnection.prototype.pquery = (sql, values) => {
    // if (typeof (values || sql) === 'function') {
    //     return (this as any).query(sql, values, cb)
    // }

    return new Promise((resolve, reject) => {
        (this as Connection).query(sql, values, (error, results) => {
            if (error) {
                reject(error)
            } else {
                resolve(results)
            }
        })
    })
}
