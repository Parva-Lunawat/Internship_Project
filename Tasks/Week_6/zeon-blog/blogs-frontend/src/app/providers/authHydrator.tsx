"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../Redux/customStoreWrapper";
import { authHydration, authLogout } from "../Redux/actions/authActions";
import { clearSession } from "@/src/lib/session";

export default function AuthHydrator() {
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.auth.user);
    
    useEffect(() => {
        dispatch(authHydration());
    }, [dispatch]);

    useEffect(() => {
        if (user && user.loginTimestamp) {
            const SIX_HOURS = 6 * 60 * 60 * 1000;
            const currentTime = Date.now();
            const timePassed = currentTime - user.loginTimestamp;

            if (timePassed > SIX_HOURS) {
                console.log("Session expired. Logging out...");
                clearSession();
                dispatch(authLogout());
            }
        }
    }, [user, dispatch]);

    return null;
}
