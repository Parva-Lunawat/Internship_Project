import { sessionUser, getSession } from "@/src/lib/session"
import { Dispatch } from "redux";

export const AUTH_HYDRATE = "AUTH_HYDRATE";
export const AUTH_LOGIN_SUCCESS = "AUTH_LOGIN_SUCCESS";
export const AUTH_LOGOUT = "AUTH_LOGOUT";

export const authHydrate = (user: sessionUser | null) => ({
    type: AUTH_HYDRATE,
    payload: user,
});

export const authLoginSuccess = (user:sessionUser) => ({
    type: AUTH_LOGIN_SUCCESS,
    payload: user,
});

export const authLogout = () => ({
    type: AUTH_LOGOUT,
});


export const authHydration = () => (dispatch: Dispatch) => {
    const session: sessionUser | null = getSession();
    dispatch(authHydrate(session));
};
