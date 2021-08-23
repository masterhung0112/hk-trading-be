declare module 'mysql/lib/Pool' {
    import { Pool as PoolInternal } from 'mysql'

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Pool extends PoolInternal {}
    class Pool {}

    export = Pool
}