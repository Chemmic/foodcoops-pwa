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

import {
    PFADE,
} from "../router/pfade.js";


export function MainBestellung() {
    const location =
        useLocation();


    // =========================================================================
    // Aktiver Tab
    // =========================================================================

    const getActiveTab =
        () => {
            if (
                location.pathname.startsWith(
                    PFADE.bestellungBrot
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
                    mb: {
                        xs: 1,
                        sm: 2,
                    },

                    border: 1,

                    borderColor:
                        "divider",

                    borderRadius:
                        2,

                    overflow:
                        "hidden",

                    flexShrink:
                        0,
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
                    sx={{
                        minHeight: {
                            xs: 44,
                            sm: 48,
                        },

                        "& .MuiTab-root": {
                            minHeight: {
                                xs: 44,
                                sm: 48,
                            },
                        },
                    }}
                >
                    <Tab
                        value="bestellung"
                        label="Frisch"
                        component={
                            Link
                        }
                        to={PFADE.bestellungFrisch}
                    />

                    <Tab
                        value="brotbestellung"
                        label="Brot"
                        component={
                            Link
                        }
                        to={PFADE.bestellungBrot}
                    />
                </Tabs>
            </Paper>


            <Routes>
                <Route
                    path="frisch"
                    element={
                        <Bestellung />
                    }
                />

                <Route
                    path="brot"
                    element={
                        <Brot />
                    }
                />


                {/* ========================================================= */}
                {/* /bestellung                                               */}
                {/* ========================================================= */}

                <Route
                    index
                    element={
                        <Navigate
                            to={PFADE.bestellungFrisch}
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
                            to={PFADE.bestellungFrisch}
                            replace
                        />
                    }
                />
            </Routes>
        </>
    );
}