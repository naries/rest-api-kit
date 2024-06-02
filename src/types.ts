export type MethodType = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";


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
    response: unknown;
    error: unknown;
    isSuccess: boolean;
    extra: unknown;
}

export type ActionTypes = 'loading/start' | 'loading/stop' | 'data/success' | 'data/error' | 'data/reset' | 'error/reset' | "extra/save";

export type QueryHookReturnType = [(body?: Record<string, string>) => void, state: RequestStateType];

export type StoreActionType = "store/save" | "store/clear";
export type StoreStateType = Record<"store", Record<string, { data: unknown }>>;

export interface IOptions<R = any, T = any> {
    preferCacheValue: boolean; // uses cached value if available,
    method: MethodType;
    saveToCache: boolean;
    updates: string[],
    endpointName: string;
    successCondition: (data: R) => boolean;
    transformResponse: (data: R, body?: T) => unknown;
}

export interface StoreHookReturnType<R, T> {
    save: (id: string, data: unknown, options: IOptions<any, any>) => void;
    get: (id: string) => unknown;
    clear: (id: string) => void;
}

export type RestOptionsType = {
    baseUrl: string;
    headers: Partial<RequestType['headers']>;
}


export type EndpointType<R, T> = {
    url: string;
    params: Partial<IOptions<R, T>>;
}

export type EndpointFix = Record<string, EndpointType<any, any>>;

export type EndpointBuilder = <U, V>(endpoint: EndpointType<U, V>) => EndpointType<U, V>;

export type BuildCallBackType = (builder: EndpointBuilder) => Record<string, EndpointType<any, any>>;

export type RestBaseReturnType = {
    createEndpoints: <T extends EndpointFix>(callback: (builder: EndpointBuilder) => T) => Record<`use${string & Capitalize<keyof T extends string ? keyof T : never>}`, () => QueryHookReturnType>;
    endpoints: EndpointFix;
}

