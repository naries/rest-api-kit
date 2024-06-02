import { ActionTypes, RequestStateType } from "../../types";

function restReducer(state: RequestStateType, { type, payload }: {
    type: ActionTypes;
    payload?: unknown;
}) {
    switch (type) {
        case "loading/start":
            return { ...state, isLoading: true };
        case "loading/stop":
            return { ...state, isLoading: false };
        case "data/success":
            return { ...state, data: payload, isSuccess: true };
        case "data/error":
            return { ...state, error: payload, isSuccess: false };
        case "data/reset":
            return { ...state, data: undefined };
        case "error/reset":
            return { ...state, error: undefined };
        case 'extra/save':
            return { ...state, extra: payload };
        case 'response/save':
            return { ...state, response: payload };
        default:
            return "Unrecognized command";
    }
}

export default restReducer;