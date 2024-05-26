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
    error: unknown;
    isSuccess: boolean;
}

export type ActionTypes = 'loading-start' | 'loading-stop' | 'update-data' | 'update-error' | 'reset-data' | 'reset-error';

export type QueryHookReturnType = [(body?: Record<string, string>) => void, state: RequestStateType];

export type StoreActionType = "store/save" | "store/clear";
export type StoreStateType = Record<"store", Record<string, { data: unknown }>>;

export interface IOptions {
    preferCachevalue: boolean; // uses cached value if available,
    method: MethodType;
    saveToCache: boolean;
    updates: string[]
}

export interface StoreHookReturnType {
    save: (id: string, data: unknown, options: IOptions) => void;
    get: (id: string) => unknown;
    clear: (id: string) => void;
}

export type RestOptionsType = {
    baseUrl: string;
    headers: Partial<RequestType['headers']>;
}

export interface EndpointType {
    url: string;
    params: { [key: string]: string };
}

export type BuildFunction = (endpoint: Partial<EndpointType>) => EndpointType;

export type ExtractEndpointKeys<T> = T extends { [K: string]: () => EndpointType } ? keyof T : never;


export type RestBaseReturnType = {
    createEndpoints: (callback: (build: BuildFunction) => { [key: string]: EndpointType }) => { [key: string]: () => QueryHookReturnType };
    endpoints: { [key: string]: EndpointType }
}

