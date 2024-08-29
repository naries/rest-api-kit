import { IOptions } from "./types";

// default options that useRest takes by default.
export const defaultOptions: IOptions<any, any> = {
  preferCacheValue: false,
  updates: [],
  method: "GET",
  saveToCache: false,
  endpointName: "",
  transformResponse: (data) => data,
  successCondition: () => true,
  bodyAsParams: false,
  headers: {},
};
