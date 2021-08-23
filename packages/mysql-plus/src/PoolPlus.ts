import PoolConfigInternal from 'mysql2/lib/pool_config'
import { PoolOptions } from 'mysql2'
import PoolInternal from 'mysql2/lib/pool'

export interface PoolPlusConfig extends PoolOptions {
    plusOptions?: {
        debug: boolean
        migrationStrategy: string
    }
}

/**
 * A class that extends the `mysql` module's `Pool` class with the ability to define tables
 * and perform queries and transactions using promises.
 */
export class PoolPlus extends PoolInternal {
    constructor(config: PoolPlusConfig) {
        super({config: new PoolConfigInternal(config)})
    }

    pquery(sql, values?: any | any[]) {
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
}