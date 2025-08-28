import {
  ActionTypes,
  IOptions,
  RestOptionsType,
  StoreStateType,
} from "../types";

export const concatenateParamsWithUrl = (
  url: string,
  body?: string | Record<string, string | number>
) => {
  if (!body) {
    return url;
  }
  if (typeof body === "string") {
    return `${url}${body}`;
  }
  // use paths url contains `/:`
  if (url.includes("/:")) {
    const queryParams = [];
    for (const [key, value] of Object.entries(body)) {
      const regex = new RegExp(`/:${key}`, "g");
      if (regex.test(url)) {
        url = url.replace(regex, `/${value}`);
      } else {
        queryParams.push(`${key}=${value}`);
      }
    }
    if (queryParams.length > 0) {
      url += `?${queryParams.join("&")}`;
    }
    return url;
  }
  const queryString = Object.entries(body)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return `${url}?${queryString}`;
};

export const createUniqueId = (
  url: string,
  params?: Record<string, string | number>
) => {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return `${url}&${queryString}`;
};

export const clearMultipleIds = (
  arrayOfIds: string[] = [],
  baseUrl: string,
  callback: (id: string) => void
) => {
  if (arrayOfIds.length === 0) {
    return;
  }

  arrayOfIds.map((endpointName: string) => {
    callback(`${baseUrl}&${endpointName}`);
    return null;
  });
};

// cache store function
export const deleteId = (state: StoreStateType, id: string) => {
  // state is the store object itself (key -> cached value)
  if (!Object.prototype.hasOwnProperty.call(state, id)) {
    return state;
  }
  delete (state as Record<string, unknown>)[id];
  return state;
};

export const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getBaseUrl = (url: string, baseUrl?: string) => {
  // check that url and baseurl exists
  // else, throw an error;
  if (!url && !baseUrl) {
    throw new Error("url not constructed properly");
  }

  // check that url has a http or https value.
  // ignore baseurl
  // else, merge baseurl with url.
  if (!/^http(s)?\:\/\//.test(url)) {
    if (baseUrl) {
      // check if url starts with a /
      if (/^\//.test(url)) {
        return baseUrl + url;
      } else {
        return `${baseUrl}/${url}`;
      }
    } else {
      throw new Error("url not constructed properly");
    }
  } else {
    return url;
  }
};

export const applyChecks = (params: IOptions, response: unknown) => {
  // check that successCondition exists
  // else, return error
  if (!params.successCondition(response)) {
    return { type: "error", response };
  }

  return {
    type: "success",
    response: params.transformResponse(response),
  };
};

export const load = (
  dispatch: React.Dispatch<{
    type: ActionTypes;
    payload?: unknown;
  }>,
  url: string,
  params: Partial<IOptions & RestOptionsType>,
  body: string | Record<string, string>
) => {
  // load extras into reducer state
  const paramForHere = { ...params };

  // delete unwanted function properties
  delete paramForHere.successCondition;
  delete paramForHere.transformResponse;

  dispatch({
    type: "extra/save",
    payload: {
      url,
      body,
      isFired: true,
      ...params,
    },
  });
};
