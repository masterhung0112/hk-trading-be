declare module 'mysql2/lib/Pool' {
    import { Pool as PoolInternal, PoolOptions } from 'mysql2'

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Pool extends PoolInternal {}
    class Pool {
        constructor(options: { config: PoolOptions })
    }

    export = Pool
}