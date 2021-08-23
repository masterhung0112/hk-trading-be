import PoolConfigInternal from 'mysql/lib/PoolConfig'
import { PoolConfig } from 'mysql'
import PoolInternal from 'mysql/lib/Pool'

export interface PoolPlusConfig extends PoolConfig {
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
}