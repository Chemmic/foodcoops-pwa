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
    Lager,
} from "./lager/Lager.jsx";

import {
    FrischBestandManagement,
} from "./frischbestandmanagement/FrischBestandManagement.jsx";

import {
    BrotBestandManagement,
} from "./brotmanagement/BrotBestandManagement.jsx";

import {
    PFADE,
} from "./router/pfade.js";


export function MainManagement() {
    const location =
        useLocation();


    // =========================================================================
    // Aktiver Tab
    // =========================================================================

    const getActiveTab = () => {
        const path =
            location.pathname;


        if (
            path.startsWith(
                PFADE.produkteFrisch
            )
        ) {
            return "frischbestandmanagement";
        }


        if (
            path.startsWith(
                PFADE.produkteBrot
            )
        ) {
            return "brotbestandmanagement";
        }


        return "lager";
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
                    aria-label="Produktmanagement"
                >
                    <Tab
                        value="lager"
                        label="Lager"
                        component={
                            Link
                        }
                        to={PFADE.produkteLager}
                    />

                    <Tab
                        value="frischbestandmanagement"
                        label="Frisch"
                        component={
                            Link
                        }
                        to={PFADE.produkteFrisch}
                    />

                    <Tab
                        value="brotbestandmanagement"
                        label="Brot"
                        component={
                            Link
                        }
                        to={PFADE.produkteBrot}
                    />
                </Tabs>
            </Paper>


            <Routes>
                <Route
                    path="lager"
                    element={
                        <Lager />
                    }
                />

                <Route
                    path="frisch"
                    element={
                        <FrischBestandManagement />
                    }
                />

                <Route
                    path="brot"
                    element={
                        <BrotBestandManagement />
                    }
                />


                {/* ========================================================= */}
                {/* /produkte                                                 */}
                {/* ========================================================= */}

                <Route
                    index
                    element={
                        <Navigate
                            to={PFADE.produkteLager}
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
                            to={PFADE.produkteLager}
                            replace
                        />
                    }
                />
            </Routes>
        </>
    );
}