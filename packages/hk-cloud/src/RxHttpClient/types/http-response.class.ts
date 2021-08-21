import { Response } from 'node-fetch'
import { from } from "rxjs/internal/observable/from"

export class HttpResponse {
    private readonly _response: Response

    constructor(response: Response) {
        this._response = response
    }

    get url() {
        return this._response.url
    }
    
    get ok() {
        return this._response.ok
    }

    json() {
        return from(this._response.json())
    }
}