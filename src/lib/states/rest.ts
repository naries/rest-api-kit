import { RequestStateType } from "../../types";

const initRestState: RequestStateType = {
    isLoading: false,
    data: undefined,
    error: undefined,
    isSuccess: false,
    extra: {
        body: {},
        isFired: false,
        url: "",
        preferCachevalue: false,
        updates: [],
        method: 'GET',
        saveToCache: false,
        endpointName: "",
    },
}

export default initRestState;