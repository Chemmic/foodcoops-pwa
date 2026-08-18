import React from 'react';

import { CssBaseline, ThemeProvider } from '@mui/material';

import './App.css';

import { AuthProvider } from './auth/AuthContext.jsx';
import { AppRouter } from './router/AppRouter.jsx';
import { ToastContainer } from 'react-toastify';
import { theme } from './theme';

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />

            <AuthProvider>
                <div className="App">
                    <AppRouter />

                    <ToastContainer
                        position="top-right"
                        autoClose={5000}
                    />
                </div>
            </AuthProvider>
        </ThemeProvider>
    );
}