import { sessionUser, getSession } from "@/src/lib/session"
import { Dispatch } from "redux";

export const AUTH_HYDRATE = "AUTH_HYDRATE";
export const AUTH_LOGIN_SUCCESS = "AUTH_LOGIN_SUCCESS";
export const AUTH_LOGOUT = "AUTH_LOGOUT";
export const AUTH_UPDATE_USER = "AUTH_UPDATE_USER";

export const authHydrate = (user: sessionUser | null) => ({
    type: AUTH_HYDRATE,
    payload: user,
});

export const authLoginSuccess = (user: sessionUser) => {
    const userWithTimestamp = { ...user, loginTimestamp: Date.now() };
    return {
        type: AUTH_LOGIN_SUCCESS,
        payload: userWithTimestamp,
    };
};

export const authLogout = () => ({
    type: AUTH_LOGOUT,
});

export const authUpdateUser = (user: sessionUser) => ({
    type: AUTH_UPDATE_USER,
    payload: user,
});


export const authHydration = () => (dispatch: Dispatch) => {
    const session: sessionUser | null = getSession();
    dispatch(authHydrate(session));
};
