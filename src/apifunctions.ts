import { FetchApiRequestType, MethodType, RequestType } from "./types";

export async function createRequest(
  url = "",
  headers = {},
  method?: MethodType,
  body = {},
  rest?: Partial<Omit<RequestType, "headers" | "url" | "method" | "body">>
) {
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
      };
    }
    const response = await fetch(url, params);
    if (!response.ok) {
      if (response.status > 299) {
        return {
          type: "error",
          data: `Request failed with status: ${response.status}`,
          info: response,
        };
      }
    }
    return { type: "success", data: await response.json() };
  } catch (error) {
    return { type: "error", data: "An error occured", info: error };
  }
}

export function makeRequest(
  payload: string | Partial<RequestType>,
  headers: Headers
) {
  if (!payload) {
    return;
  }
  if (typeof payload === "string") {
    return createRequest(payload, headers);
  }
  const { url, method, body, ...rest } = payload;
  return createRequest(url, headers, method, body, rest);
}
