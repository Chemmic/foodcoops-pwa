import React from "react";
import "./App.css";
import "./Header.css";

import { AuthProvider } from "./auth/AuthContext";
import { AppRouter } from "./router/AppRouter";

export default function App() {
    return (
        <AuthProvider>
            <div className="App">
                <AppRouter />
            </div>
        </AuthProvider>
    );
}