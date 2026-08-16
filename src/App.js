import React from "react";
import "./App.css";
import "./Header.css";

import { AuthProvider } from "./auth/AuthContext";
import { AppRouter } from "./router/AppRouter";
import {ToastContainer} from "react-toastify";

export default function App() {
    return (
        <AuthProvider>
            <div className="App">
                <AppRouter />
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                />
            </div>
        </AuthProvider>
    );
}