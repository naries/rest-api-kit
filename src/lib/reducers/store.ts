import { deleteId } from "../../helpers/misc";
import { IOptions, StoreActionType, StoreStateType } from "../../types";

function storeReducer(state: StoreStateType, { type, payload }: {
    type: StoreActionType;
    payload: {
        id: string, data: unknown, options?: IOptions
    };
}) {
    switch (type) {
        case "store/save":
            return { ...state, store: { ...state.store, [payload.id]: payload.data } };
        case "store/clear":
            let currentState = { ...state }
            return deleteId(currentState, payload.id);
        default:
            return "Unrecognized command";
    }
}

export default storeReducer;