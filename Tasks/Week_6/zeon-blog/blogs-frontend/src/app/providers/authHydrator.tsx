"use client";

import { useEffect } from "react";
import { useAppDispatch } from "../Redux/customStoreWrapper";
import { authHydration } from "../Redux/actions/authActions";

export default function AuthHydrator() {
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(authHydration());
    }, [dispatch]);
    return null;
}