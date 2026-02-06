"use client";

import { Provider } from "react-redux";
import store from "../Redux/store";
import AuthHydrator from "./authHydrator";

export default function ReduxProvider({children}: {children: React.ReactNode}) {
    return (
        <Provider store={store}>
            <AuthHydrator />
            {children}
        </Provider>
    );
}