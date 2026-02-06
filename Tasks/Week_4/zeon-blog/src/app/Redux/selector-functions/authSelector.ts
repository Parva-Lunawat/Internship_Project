import { RootState } from "../store";

export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthHydrated = (state: RootState) => state.auth.hydrated;