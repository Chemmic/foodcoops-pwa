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
    PFADE,
    istAktiv,
} from "../router/pfade.js";

import { BestellungFestlegen } from "./BestellungFestlegen.jsx";
import { LagerAuffuellen } from "./LagerAuffuellen.jsx";


/**
 * ============================================================================
 * Organisation (Rolle Organisator)
 * ============================================================================
 *
 *   /organisation/bestellung   was beim Händler bestellt wird (Frisch, Brot)
 *   /organisation/lager        was fürs Lager gekauft werden muss
 */
export function Organisation() {
    const location =
        useLocation();

    const aktiv =
        istAktiv(location.pathname, PFADE.organisationLager)
            ? "lager"
            : "bestellung";


    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    mb: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                    flexShrink: 0,
                }}
            >
                <Tabs
                    value={aktiv}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    aria-label="Bereiche der Organisation"
                >
                    <Tab
                        value="bestellung"
                        label="Bestellung beim Händler"
                        component={Link}
                        to={PFADE.organisationBestellung}
                    />

                    <Tab
                        value="lager"
                        label="Lager auffüllen"
                        component={Link}
                        to={PFADE.organisationLager}
                    />
                </Tabs>
            </Paper>


            <Routes>
                <Route
                    path="bestellung"
                    element={<BestellungFestlegen />}
                />

                <Route
                    path="lager"
                    element={<LagerAuffuellen />}
                />

                <Route
                    index
                    element={
                        <Navigate
                            to={PFADE.organisationBestellung}
                            replace
                        />
                    }
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to={PFADE.organisationBestellung}
                            replace
                        />
                    }
                />
            </Routes>
        </>
    );
}
