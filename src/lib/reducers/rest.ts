import { ActionTypes, RequestStateType } from "../../types";

function restReducer<TData = unknown>(
  state: RequestStateType<TData>,
  {
    type,
    payload,
  }: {
    type: ActionTypes;
    payload?: unknown;
  }
): RequestStateType<TData> {
  switch (type) {
    case "response/state/save": {
      return {
        ...state,
        response: payload,
        data: (payload as any)?.data,
        isLoading: false,
        isSuccess: true,
      };
    }
    case "reset/loading":
      return {
        ...state,
        isLoading: true,
        data: undefined as any,
        error: undefined,
        isSuccess: false,
      };
    case "loading/start":
      return { ...state, isLoading: true };
    case "loading/stop":
      return { ...state, isLoading: false };
    case "data/success":
      return {
        ...state,
        data: payload as TData,
        error: undefined,
        isLoading: false,
        isSuccess: true,
      };
    case "data/error":
      return {
        ...state,
        data: undefined as any,
        error: payload,
        isSuccess: false,
        isLoading: false,
      };
    case "data/reset":
      return { ...state, data: undefined as any };
    case "error/reset":
      return { ...state, error: undefined };
    case "extra/save":
      return {
        ...state,
        extra: payload,
        data: undefined as any,
        error: undefined,
        response: undefined,
        isLoading: false,
      };
    case "response/save":
      return { ...state, response: payload };
    case "response/reset":
      return { ...state, response: undefined };
    default:
      return state;
  }
}

export default restReducer;
