// import { Connection, Query, QueryOptions, queryCallback } from 'mysql'
import { Connection as InternalConnection } from 'mysql/lib/Connection'

declare module 'mysql' {
    export interface PQueryFunction {
        (query: Query): Promise<Query>;
        (options: string | QueryOptions, callback?: queryCallback): Promise<Query>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (options: string | QueryOptions, values: any[], callback?: queryCallback): Promise<Query>;
    }

    // Extends existing Connection interface
    export interface Connection {
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
InternalConnection.prototype.pquery = (sql, values, cb) => {
    if (typeof (cb || values || sql) === 'function') {
        return (this as any).query(sql, values, cb)
    }

    return new Promise((resolve, reject) => {
        (this as any).query(sql, values, (error, results) => {
            if (error) {
                reject(error)
            } else {
                resolve(results)
            }
        })
    })
}
