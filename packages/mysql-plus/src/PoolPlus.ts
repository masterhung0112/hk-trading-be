// import PoolInternal from 'mysql2/lib/pool'

import { createPool, Pool as PoolInternal, PoolOptions as PoolOptionsInternal } from 'mysql2'
// import { createPool } from 'mysql2/promise'
// import PoolInternal from 'mysql2/lib/pool'
// import Pool from 'mysql2/typings/mysql/lib/Pool'
// import Pool from 'mysql2/typings/mysql/lib/Pool'

// declare module 'mysql2' {
  // interface Pool {}
  // eslint-disable-next-line @typescript-eslint/no-shadow
  // export class Pool {
    // constructor(c: {config: PoolOptionsInternal}) 
  // }
// }


export interface PoolPlusConfig extends PoolOptionsInternal {
    plusOptions?: {
        debug: boolean
        migrationStrategy: string
    }
}

export interface PoolPlus {
  pquery(sql: any, values?: any | any[])
}

/**
 * A class that extends the `mysql` module's `Pool` class with the ability to define tables
 * and perform queries and transactions using promises.
 */

export function PoolPlus(config: PoolPlusConfig) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { plusOptions, ...rest } = config
  // Object.setPrototypeOf(this, createPool(rest))
  // PoolInternal.call(this, rest)
  Object.assign(this, createPool(rest))
}

PoolPlus.prototype = Object.create(PoolInternal.prototype)
PoolPlus.prototype.constructor = PoolPlus

PoolPlus.prototype.pquery = function(sql, values?: any | any[]) {
    if (typeof (values || sql) === 'function') {
      return this.query(sql, values)
    }

    return new Promise((resolve, reject) => {
      this.query(sql, values, (error, results) => {
        if (error) {
          reject(error)

        } else {
          resolve(results)
        }
      })
    })
  
}

// export class PoolPlus extends PoolInternal {
//     constructor(config: PoolPlusConfig) {
//         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//         const { plusOptions, ...rest } = config
//         super({config: new PoolOptionsInternal({...rest})})
//     }

//     pquery(sql, values?: any | any[]) {
//         if (typeof (values || sql) === 'function') {
//           return this.query(sql, values)
//         }
    
//         return new Promise((resolve, reject) => {
//           this.query(sql, values, (error, results) => {
//             if (error) {
//               reject(error)
//             } else {
//               resolve(results)
//             }
//           })
//         })
//       }
// }