import { ActionTypes, RequestStateType } from "../../types";

function restReducer(
  state: RequestStateType,
  {
    type,
    payload,
  }: {
    type: ActionTypes;
    payload?: unknown;
  }
) {
  switch (type) {
    case "response/state/save": {
      return {
        ...state,
        response: payload,
        data: payload?.data,
        isLoading: false,
        isSuccess: true,
      };
    }
    case "reset/loading":
      return {
        ...state,
        isLoading: true,
        data: undefined,
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
        data: payload,
        error: undefined,
        isLoading: false,
        isSuccess: true,
      };
    case "data/error":
      return {
        ...state,
        data: undefined,
        error: payload,
        isSuccess: false,
        isLoading: false,
      };
    case "data/reset":
      return { ...state, data: undefined };
    case "error/reset":
      return { ...state, error: undefined };
    case "extra/save":
      return {
        ...state,
        extra: payload,
        data: undefined,
        error: undefined,
        response: undefined,
        isLoading: false,
      };
    case "response/save":
      return { ...state, response: payload };
    case "response/reset":
      return { ...state, response: undefined };
    default:
      return "Unrecognized command";
  }
}

export default restReducer;
