export type MethodType = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export type RequestType = {
  url: string;
  method: MethodType;
  mode: RequestMode;
  cache: "default" | "no-cache" | "reload" | "force-cache" | "only-if-cached";
  credentials: "same-origin" | "include" | "omit";
  redirect: "manual" | "follow" | "error";
  referrerPolicy: "no-referrer" | "no-referrer-when-downgrade" | "origin";
  body: Record<string, unknown>;
  headers: HeadersInit;
};

export type FetchApiRequestType = Omit<Partial<RequestType>, "body"> & {
  body?: string;
};
export type RequestStateType<TData = unknown> = {
  isLoading: boolean;
  data: TData;
  response: unknown;
  error: unknown;
  isSuccess: boolean;
  extra: unknown;
};

export type ActionTypes =
  | "loading/start"
  | "loading/stop"
  | "data/success"
  | "data/error"
  | "data/reset"
  | "error/reset"
  | "extra/save"
  | "response/save"
  | "response/reset"
  | "reset/loading"
  | "response/state/save";

export type QueryHookReturnType = [
  (body?: Record<string, string>) => void,
  state: RequestStateType
];

export type TypedQueryHookReturnType<TBody = void, TData = unknown> = [
  (body?: TBody) => void,
  state: RequestStateType<TData>
];

export type StoreActionType = "store/save" | "store/clear";
export type StoreStateType = Record<string, any>;

export interface IOptions<R = any, T = any> {
  preferCacheValue: boolean; // uses cached value if available,
  method: MethodType;
  saveToCache: boolean;
  updates: string[];
  endpointName: string;
  successCondition: (data: R) => boolean;
  transformResponse: (data: R, body?: T) => unknown;
  headers: HeadersInit;
  bodyAsParams: boolean;
}

export interface StoreHookReturnType<R, T> {
  save: (id: string, data: unknown, options: IOptions<any, any>) => void;
  get: (id: string) => unknown;
  clear: (id: string) => void;
  getAll: () => StoreStateType;
}

export type RestOptionsType = {
  baseUrl: string;
  prepareHeaders: (headers: Headers) => Headers;
};

export type EndpointType<R, T> = {
  url: string;
  params?: Partial<IOptions<R, T>>;
};

export type CompleteEndpointType<R, T> = {
  url: string;
  params?: IOptions<R, T>;
};

export type EndpointFix = Record<string, EndpointType<any, any>>;
export type CompleteEndpointFix = Record<
  string,
  CompleteEndpointType<any, any>
>;

export type EndpointBuilder = <U, V>(
  endpoint: EndpointType<U, V>
) => CompleteEndpointType<U, V>;

export type BuildCallBackType = (
  builder: EndpointBuilder
) => Record<string, EndpointType<any, any>>;

export type RestBaseReturnType<T extends Record<string, any> = {}> = {
  createEndpoints: <U extends CompleteEndpointFix>(
    callback: (builder: EndpointBuilder) => U
  ) => RestBaseReturnType<U>;
  endpoints: EndpointFix;
} & {
  [K in keyof T as `use${Capitalize<string & K>}`]: () => T[K] extends CompleteEndpointType<infer R, infer B> 
    ? TypedQueryHookReturnType<B, R>
    : QueryHookReturnType;
};
