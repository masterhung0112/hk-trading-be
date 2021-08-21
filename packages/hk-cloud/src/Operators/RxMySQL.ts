import { QueryOptions, Connection, ConnectionConfig, createConnection, Query } from "mysql";
import { Observable } from "rxjs/internal/Observable";

export type MySqlConnectionConfig = string | ConnectionConfig

export class RxMySQL {
    private _connection: Connection
    constructor(connectionConfig: MySqlConnectionConfig) {
        this._connection = createConnection(connectionConfig)
    }

    public query<T>(options: string | QueryOptions, values?: any): Observable<T> {
        return new Observable((observer) => {
            this._connection.query(options, values, (err, result) => {
                if (err) observer.error(err)
                else {
                    observer.next(result)
                }
                observer.complete()
            })
        })
    }

    public destroyConnection() {
        this._connection.destroy()
    }
}