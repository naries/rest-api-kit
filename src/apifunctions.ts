import { FetchApiRequestType, MethodType, RequestType } from "./types";

export async function createRequest(
    url = "", 
    method?: MethodType,
    body = {},
    headers = { "Content-Type": "application/json" },
    rest?: Partial<Omit<RequestType, "headers" | "url" | "method" | "body">>) {
    try {
        let params: Partial<FetchApiRequestType> = {
            method: method ?? "GET",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers,
            redirect: "follow",
            referrerPolicy: "no-referrer",
            ...rest,
        };
        if (method && method !== "GET") {
            params = {
                body: JSON.stringify(body),
                ...params,
            }
        }
        const response = await fetch(url, params);
        return response.json();
    } catch (error) {
        console.log(error, "rest-api-kit-error")
    }
}

export function makeRequest(payload: string | Partial<RequestType>) {
    if (!payload) {
        return;
    }
    if (typeof payload === 'string') {
        return createRequest(payload);
        return;
    }
    const { url, method, body, headers, ...rest } = payload;
    return createRequest(url, method, body, headers, rest);
}

