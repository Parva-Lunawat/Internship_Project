import { AUTH_HYDRATE, AUTH_LOGIN_SUCCESS, AUTH_LOGOUT } from "../actions/authActions";
import type { sessionUser } from "@/src/lib/session";

type authState = {
    user: sessionUser | null;
    hydrated: boolean;
};

const initialState: authState = {
    user: null,
    hydrated: false,
};

type AuthAction =
    | { type: typeof AUTH_HYDRATE; payload: sessionUser | null }
    | { type: typeof AUTH_LOGIN_SUCCESS; payload: sessionUser }
    | { type: typeof AUTH_LOGOUT };

export default function authReducer(state: authState = initialState, action: AuthAction): authState {
    switch(action.type) {
        case AUTH_HYDRATE: {
            return {
                ...state,
                user: action.payload,
                hydrated: true,
            };
        }
        case AUTH_LOGIN_SUCCESS: {
            return {
                ...state,
                user: action.payload,
                hydrated: true,
            };
        }
        case  AUTH_LOGOUT: {
            return {
                ...state,
                user: null,
                hydrated: true,
            };
        }

        default:
            return state;
    }
}