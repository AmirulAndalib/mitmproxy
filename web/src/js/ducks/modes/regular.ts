import {
    RECEIVE as RECEIVE_STATE,
    UPDATE as UPDATE_STATE,
} from "../backendState";
import {
    getModesOfType,
    isActiveMode,
    includeListenAddress,
    ModeState,
    updateMode,
} from "./utils";
import type { ModesState } from "../modes";

export const MODE_REGULAR_TOGGLE = "MODE_REGULAR_TOGGLE";
export const MODE_REGULAR_SET_PORT = "MODE_REGULAR_SET_PORT";
export const MODE_REGULAR_ERROR = "MODE_REGULAR_ERROR";
export const MODE_REGULAR_SET_HOST = "MODE_REGULAR_SET_HOST";

export const DEFAULT_PORT = 8080;

interface RegularState extends ModeState {}

export const initialState: RegularState = {
    active: true,
};

export const getSpecs = ({ regular }: ModesState): string[] => {
    if (!isActiveMode(regular)) {
        return [];
    }
    return [includeListenAddress("regular", regular)];
};

export const toggleRegular = () => async (dispatch) => {
    dispatch({ type: MODE_REGULAR_TOGGLE });

    try {
        await dispatch(updateMode());
    } catch (e) {
        dispatch({ type: MODE_REGULAR_ERROR, error: e.message });
    }
};

export const setPort = (port: number) => async (dispatch) => {
    dispatch({ type: MODE_REGULAR_SET_PORT, port });

    try {
        await dispatch(updateMode());
    } catch (e) {
        dispatch({ type: MODE_REGULAR_ERROR, error: e.message });
    }
};

export const setHost = (host: string) => async (dispatch) => {
    dispatch({ type: MODE_REGULAR_SET_HOST, host });

    try {
        await dispatch(updateMode());
    } catch (e) {
        dispatch({ type: MODE_REGULAR_ERROR, error: e.message });
    }
};

const regularReducer = (state = initialState, action): RegularState => {
    switch (action.type) {
        case MODE_REGULAR_TOGGLE:
            return {
                ...state,
                active: !state.active,
                error: undefined,
            };
        case MODE_REGULAR_SET_PORT:
            return {
                ...state,
                listen_port: action.port as number,
                error: undefined,
            };
        case MODE_REGULAR_SET_HOST:
            return {
                ...state,
                listen_host: action.host,
                error: undefined,
            };
        case UPDATE_STATE:
        case RECEIVE_STATE:
            if (action.data && action.data.servers) {
                const currentModeConfig = getModesOfType(
                    "regular",
                    action.data.servers,
                )[0];
                const isActive = currentModeConfig !== undefined;
                return {
                    ...state,
                    active: isActive,
                    listen_host: isActive
                        ? currentModeConfig.listen_host
                        : state.listen_host,
                    listen_port: isActive
                        ? (currentModeConfig.listen_port as number) ||
                          DEFAULT_PORT
                        : state.listen_port,
                    error: isActive ? undefined : state.error,
                };
            }
            return state;
        case MODE_REGULAR_ERROR:
            return {
                ...state,
                error: action.error,
            };
        default:
            return state;
    }
};

export default regularReducer;
