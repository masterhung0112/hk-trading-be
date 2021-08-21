import fetch, { RequestInit as NodeFetchRequestInit } from 'node-fetch'
import { from, map, Observable, tap } from "rxjs";
import { throwIfNotOkResponse } from "./http-error-handler.helper";
import { HttpResponse } from "./types/http-response.class";

export type RequestInit = NodeFetchRequestInit

export class RxHttpClient {
    public request(method: string, url: string, config?: RequestInit): Observable<HttpResponse> {
        const configObject: RequestInit = {
            ...config,
            method,
        }
        return from(fetch(url, configObject))
        .pipe(
            map((response) => new HttpResponse(response)),
            tap(throwIfNotOkResponse),
        )
    }
}