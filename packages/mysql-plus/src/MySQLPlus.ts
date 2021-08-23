import { PoolPlus, PoolPlusConfig } from './PoolPlus'

export class MySQLPlus {
    static createPool(config: PoolPlusConfig) {
        return new PoolPlus(config)
    }
}