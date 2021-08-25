// declare module 'mysql2/lib/pool' {
//     import { PoolOptions } from 'mysql2'
//     // import { Pool as PoolInternal, PoolOptions } from 'mysql2'

//     // eslint-disable-next-line @typescript-eslint/no-empty-interface
//     // interface Pool extends PoolInternal {}
//     class Pool {
//         constructor(options: { config: PoolOptions })
//     }

//     export = Pool
// }

// declare module 'mysql2' {
//     // namespace mysql2 {
//         import * as mysql2 from 'mysql2'
//         // export * from 'mysql2'

//         export interface Pool extends mysql2.Pool {}
//         export interface Connection extends mysql2.Connection {}
//         export class Connection {
//             // constructor(options: { config: PoolOptions })
//         }

//         // export = mysql2
//     // }
// }
// import { PoolOptions } from 'mysql2'

// declare module 'mysql2' {
//     export class Pool {
//       constructor(c: {config: PoolOptions}) 
//     }
//   }
  

// declare module 'mysql2' {
//   // interface Pool {}
//   // eslint-disable-next-line @typescript-eslint/no-shadow
//   export class Pool {
//     // constructor(c: {config: PoolOptionsInternal}) 
//   }
// }