import React from "react";

import {
    Link,
    Navigate,
    Route,
    Routes,
    useLocation,
} from "react-router";

import {
    Paper,
    Tab,
    Tabs,
} from "@mui/material";

import {
    Bestellung,
} from "./Bestellung.jsx";

import {
    Brot,
} from "../brot/Brot.jsx";


export function MainBestellung() {
    const location =
        useLocation();


    // =========================================================================
    // Aktiver Tab
    // =========================================================================

    const getActiveTab = () => {
        if (
            location.pathname.startsWith(
                "/mainBestellung/brotbestellung"
            )
        ) {
            return "brotbestellung";
        }


        return "bestellung";
    };


    // =========================================================================
    // Render
    // =========================================================================

    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    mb: 2,

                    border: 1,
                    borderColor:
                        "divider",

                    borderRadius: 2,

                    overflow:
                        "hidden",

                    flexShrink: 0,
                }}
            >
                <Tabs
                    value={
                        getActiveTab()
                    }
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    aria-label="Bestellbereiche"
                >
                    <Tab
                        value="bestellung"
                        label="Frisch"
                        component={
                            Link
                        }
                        to="/mainBestellung/bestellung"
                    />

                    <Tab
                        value="brotbestellung"
                        label="Brot"
                        component={
                            Link
                        }
                        to="/mainBestellung/brotbestellung"
                    />
                </Tabs>
            </Paper>


            <Routes>
                <Route
                    path="bestellung"
                    element={
                        <Bestellung />
                    }
                />

                <Route
                    path="brotbestellung"
                    element={
                        <Brot />
                    }
                />


                {/* ========================================================= */}
                {/* /mainBestellung                                           */}
                {/* ========================================================= */}

                <Route
                    index
                    element={
                        <Navigate
                            to="/mainBestellung/bestellung"
                            replace
                        />
                    }
                />


                {/* ========================================================= */}
                {/* Ungültige Unterroute                                      */}
                {/* ========================================================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/mainBestellung/bestellung"
                            replace
                        />
                    }
                />
            </Routes>
        </>
    );
}