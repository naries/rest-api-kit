export type MethodType = "GET" | "POST" | "PUT" | "DELETE";


export type RequestType = {
    url: string;
    method: MethodType
    mode: RequestMode,
    cache: "default" | "no-cache" | "reload" | "force-cache" | "only-if-cached",
    credentials: "same-origin" | "include" | "same-origin" | "omit",
    redirect: "manual" | "follow" | "error",
    referrerPolicy: "no-referrer" | "no-referrer-when-downgrade" | "origin";
    body: Record<string, unknown>;
    headers: Record<"Content-Type", string>;
}

export type FetchApiRequestType = Omit<Partial<RequestType>, "body"> & { body?: string };
export type RequestStateType = {
    isLoading: boolean;
    data: unknown;
    error: unknown;
    isSuccess: boolean;
}

export type ActionTypes = 'loading-start' | 'loading-stop' | 'update-data' | 'update-error' | 'reset-data' | 'reset-error';

export type QueryHookReturnType = [() => void, state: RequestStateType];