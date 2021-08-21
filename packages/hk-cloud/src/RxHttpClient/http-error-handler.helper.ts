import { HttpResponse } from "./types/http-response.class";

export function throwIfNotOkResponse(response: HttpResponse): void {
    if (!response.ok) {
        throw response;
    }
}