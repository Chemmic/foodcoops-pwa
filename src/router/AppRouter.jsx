import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    BrowserRouter,
    Link,
    Navigate,
    Route,
    Routes,
    useLocation,
} from "react-router";
import AccountCircleOutlinedIcon
    from "@mui/icons-material/AccountCircleOutlined";

import {
    Profil,
} from "../profil/Profil.jsx";
import {
    AppBar,
    Avatar,
    Box,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Toolbar,
    Tooltip,
    Typography,
    useMediaQuery,
} from "@mui/material";

import {
    useTheme,
} from "@mui/material/styles";

import MenuIcon
    from "@mui/icons-material/Menu";

import HomeOutlinedIcon
    from "@mui/icons-material/HomeOutlined";

import AddShoppingCartOutlinedIcon
    from "@mui/icons-material/AddShoppingCartOutlined";

import ShoppingCartOutlinedIcon
    from "@mui/icons-material/ShoppingCartOutlined";

import Inventory2OutlinedIcon
    from "@mui/icons-material/Inventory2Outlined";

import SettingsOutlinedIcon
    from "@mui/icons-material/SettingsOutlined";

import InfoOutlinedIcon
    from "@mui/icons-material/InfoOutlined";

import AdminPanelSettingsOutlinedIcon
    from "@mui/icons-material/AdminPanelSettingsOutlined";

import FactCheckOutlinedIcon
    from "@mui/icons-material/FactCheckOutlined";

import ZoomInOutlinedIcon
    from "@mui/icons-material/ZoomInOutlined";

import ZoomOutOutlinedIcon
    from "@mui/icons-material/ZoomOutOutlined";

import LockOutlinedIcon
    from "@mui/icons-material/LockOutlined";

import {
    About,
} from "../About.jsx";

import {
    MainBestellung,
} from "../bestellung/MainBestellung.jsx";

import {
    MainEinkauf,
} from "../einkauf/MainEinkauf.jsx";

import {
    MainManagement,
} from "../MainManagement.jsx";

import {
    MainAdmin,
} from "../admin/MainAdmin.jsx";

import {
    PrivateRoute,
} from "../auth/PrivateRoute.jsx";

import {
    Home,
} from "../Home.jsx";

import {
    AuthButton,
} from "../auth/AuthButton.jsx";

import {
    useAuth,
} from "../auth/AuthContext.jsx";

import {
    RECHTE,
    benoetigteRollen,
    sichtbareBereiche,
} from "../auth/rechte.js";

import {
    Organisation,
} from "../organisation/Organisation.jsx";

import {
    Verwaltung,
} from "../verwaltung/Verwaltung.jsx";

import {
    PFADE,
    istAktiv,
    neuerPfad,
} from "./pfade.js";

import "./AppRouter.css";


/** Alte URLs (z.B. /mainAdmin/...) umleiten, alles andere zum Start. */
function AlteUrlWeiterleitung() {
    const location =
        useLocation();

    return (
        <Navigate
            to={
                neuerPfad(location.pathname) ??
                PFADE.start
            }
            replace
        />
    );
}


const DRAWER_WIDTH = 270;


/** Einträge der Hauptnavigation – was sichtbar ist, legt auth/rechte.js fest. */
const NAVIGATION_EINTRAEGE = {
    start: {
        label: "Home",
        path: PFADE.start,
        icon: <HomeOutlinedIcon />,
    },
    profil: {
        label: "Mein Profil",
        path: PFADE.profil,
        icon: <AccountCircleOutlinedIcon />,
    },
    bestellung: {
        label: "Bestellung",
        path: PFADE.bestellung,
        icon: <AddShoppingCartOutlinedIcon />,
        rollen: RECHTE.bestellung,
    },
    einkauf: {
        label: "Einkauf",
        path: PFADE.einkauf,
        icon: <ShoppingCartOutlinedIcon />,
        rollen: RECHTE.einkauf,
    },
    produkte: {
        label: "Produkt-Management",
        path: PFADE.produkte,
        icon: <Inventory2OutlinedIcon />,
    },
    konfiguration: {
        label: "Konfiguration",
        path: PFADE.konfiguration,
        icon: <SettingsOutlinedIcon />,
    },
    organisation: {
        label: "Organisation",
        path: PFADE.organisation,
        icon: <FactCheckOutlinedIcon />,
    },
    verwaltung: {
        label: "Verwaltung",
        path: PFADE.verwaltung,
        icon: <AdminPanelSettingsOutlinedIcon />,
    },
};


// =============================================================================
// Router
// =============================================================================

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
};


// =============================================================================
// App Content
// =============================================================================

const AppContent = () => {
    const location =
        useLocation();

    const theme =
        useTheme();


    const isDesktop =
        useMediaQuery(
            theme.breakpoints.up(
                "lg"
            )
        );


    const {
        keycloak,
        authenticated,
        hasRoles,
    } = useAuth();


    const [
        mobileMenuOpen,
        setMobileMenuOpen,
    ] =
        useState(false);


    const [
        isLarge,
        setIsLarge,
    ] =
        useState(false);


    const username =
        keycloak
            ?.tokenParsed
            ?.preferred_username ??
        "";


    /*
     * Bei diesen Bereichen soll NICHT die komplette Browserseite
     * scrollen.
     *
     * Stattdessen bekommen die Screens exakt den verfügbaren Platz
     * zwischen AppBar und Browser-Unterkante.
     *
     * Die Tabellen scrollen dann intern.
     */
    const fixedViewportLayout =
        istAktiv(location.pathname, PFADE.bestellung) ||
        istAktiv(location.pathname, PFADE.produkte);


    // =========================================================================
    // Größere Schrift
    // =========================================================================

    useEffect(
        () => {
            document.documentElement
                .style
                .setProperty(
                    "--font-size",
                    isLarge
                        ? "1.25em"
                        : "1em"
                );


            document.documentElement
                .style
                .setProperty(
                    "--current-site-name-font-size",
                    isLarge
                        ? "1.5em"
                        : "30px"
                );


            document.documentElement
                .style
                .setProperty(
                    "--current-user-name-font-size",
                    isLarge
                        ? "1.1em"
                        : "20px"
                );


            document.documentElement
                .style
                .setProperty(
                    "--deadline-font-size",
                    isLarge
                        ? "1.5em"
                        : "20px"
                );


            document.documentElement
                .style
                .setProperty(
                    "--zuVielzuWenigFrischEinkauf-font-size",
                    isLarge
                        ? "1em"
                        : "15px"
                );
        },
        [
            isLarge,
        ]
    );


    // =========================================================================
    // Mobile Navigation schließen
    // =========================================================================

    useEffect(
        () => {
            setMobileMenuOpen(
                false
            );
        },
        [
            location.pathname,
        ]
    );


    // =========================================================================
    // Navigation
    // =========================================================================

    // Nur Bereiche mit Rechten; Bestellung / Einkauf immer (sonst gesperrt)
    const navigationItems =
        useMemo(
            () =>
                sichtbareBereiche(
                    authenticated,
                    hasRoles
                ).map(({ bereich, gesperrt }) => ({
                    ...NAVIGATION_EINTRAEGE[bereich],
                    gesperrt,
                })),
            [
                authenticated,
                hasRoles,
            ]
        );


    const secondaryNavigationItems =
        useMemo(
            () => [
                {
                    label:
                        "Impressum",

                    path:
                        PFADE.impressum,

                    icon:
                        <InfoOutlinedIcon />,
                },
            ],
            []
        );


    // =========================================================================
    // Seitentitel
    // =========================================================================

    const getPageName = () => {
        const currentRoute =
            location.pathname;


        if (
            istAktiv(currentRoute, PFADE.bestellung)
        ) {
            return "Bestellung";
        }
if (
            istAktiv(currentRoute, PFADE.profil)
        ) {
            return "Mein Profil";
        }

        if (
            istAktiv(currentRoute, PFADE.einkauf)
        ) {
            return "Einkauf";
        }


        if (
            istAktiv(currentRoute, PFADE.produkte)
        ) {
            return "Produkt-Management";
        }


        if (
            istAktiv(currentRoute, PFADE.konfiguration)
        ) {
            return "Konfiguration";
        }


        if (
            istAktiv(currentRoute, PFADE.verwaltung)
        ) {
            return "Verwaltung";
        }


        if (
            istAktiv(currentRoute, PFADE.organisation)
        ) {
            return "Organisation";
        }


        if (
            istAktiv(currentRoute, PFADE.impressum)
        ) {
            return "Impressum";
        }


        return "Home";
    };


    // =========================================================================
    // Active Navigation
    // =========================================================================

    const isRouteActive = (
        path
    ) =>
        istAktiv(
            location.pathname,
            path
        );


    // =========================================================================
    // Initialen
    // =========================================================================

    const getInitials = () => {
        if (
            !username
        ) {
            return "?";
        }


        const parts =
            username
                .trim()
                .split(
                    /[\s._-]+/
                )
                .filter(
                    Boolean
                );


        if (
            parts.length ===
            1
        ) {
            return parts[0]
                .substring(
                    0,
                    2
                )
                .toUpperCase();
        }


        return (
            parts[0][0] +
            parts[
                parts.length -
                1
            ][0]
        ).toUpperCase();
    };


    // =========================================================================
    // Navigation Item
    // =========================================================================

    const renderNavigationItem =
        item => {
            const active =
                isRouteActive(
                    item.path
                );

            const sperrHinweis =
                item.gesperrt
                    ? authenticated
                        ? `Nur mit der Rolle „${benoetigteRollen(item.rollen).join(" oder ")}“`
                        : "Bitte zuerst anmelden"
                    : undefined;


            return (
                <ListItemButton
                    key={
                        item.path
                    }
                    component={
                        Link
                    }
                    to={
                        item.path
                    }
                    selected={
                        active
                    }
                    title={
                        sperrHinweis
                    }
                    sx={{
                        opacity:
                            item.gesperrt
                                ? 0.6
                                : 1,

                        mx:
                            1.5,

                        mb:
                            0.5,

                        px:
                            1.5,

                        "& .MuiListItemIcon-root":
                            {
                                color:
                                    active
                                        ? "primary.main"
                                        : "text.secondary",
                            },
                    }}
                >
                    <ListItemIcon
                        sx={{
                            minWidth:
                                42,
                        }}
                    >
                        {
                            item.icon
                        }
                    </ListItemIcon>


                    <ListItemText
                        primary={
                            item.label
                        }
                        slotProps={{
                            primary: {
                                sx: {
                                    fontSize:
                                        "0.9375rem",

                                    fontWeight:
                                        active
                                            ? 650
                                            : 500,
                                },
                            },
                        }}
                    />

                    {item.gesperrt && (
                        <LockOutlinedIcon
                            fontSize="small"
                            titleAccess={
                                sperrHinweis
                            }
                            sx={{
                                color:
                                    "text.disabled",
                            }}
                        />
                    )}
                </ListItemButton>
            );
        };


    // =========================================================================
    // Drawer
    // =========================================================================

    const drawerContent = (
        <Box
            sx={{
                height:
                    "100%",

                display:
                    "flex",

                flexDirection:
                    "column",
            }}
        >
            <Box
                component={
                    Link
                }
                to={PFADE.start}
                sx={{
                    minHeight:
                        76,

                    px:
                        2.5,

                    display:
                        "flex",

                    alignItems:
                        "center",

                    gap:
                        1.5,

                    color:
                        "inherit",

                    textDecoration:
                        "none",
                }}
            >
                <Box
                    component="img"
                    src="/manifest-icon-512.png"
                    alt="FoodCoop MiKa"
                    sx={{
                        width:
                            42,

                        height:
                            42,

                        borderRadius:
                            1.5,

                        objectFit:
                            "contain",
                    }}
                />


                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            color:
                                "text.primary",

                            lineHeight:
                                1.15,
                        }}
                    >
                        FoodCoop MiKa
                    </Typography>


                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        Gemeinsam einkaufen
                    </Typography>
                </Box>
            </Box>


            <Divider />


            <Box
                sx={{
                    flex:
                        1,

                    overflowY:
                        "auto",

                    py:
                        2,
                }}
            >
                <List
                    disablePadding
                >
                    {
                        navigationItems.map(
                            renderNavigationItem
                        )
                    }
                </List>

                {!authenticated && (
                    <Box
                        sx={{
                            px:
                                2.5,

                            py:
                                2,
                        }}
                    >
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Bitte melde dich an, um die
                            FoodCoop-MiKa-Anwendung zu nutzen.
                        </Typography>
                    </Box>
                )}


                <Box
                    sx={{
                        mt:
                            2,
                    }}
                >
                    <Divider
                        sx={{
                            mx:
                                2,

                            mb:
                                1.5,
                        }}
                    />


                    <List
                        disablePadding
                    >
                        {
                            secondaryNavigationItems.map(
                                renderNavigationItem
                            )
                        }
                    </List>
                </Box>
            </Box>


            <Divider />


            <Box
                sx={{
                    p:
                        2,
                }}
            >
                {authenticated &&
                    username && (
                    <Stack
                        direction="row"
                        spacing={
                            1.5
                        }
                        sx={{
                            alignItems: "center",
                            mb:
                                2,

                            px:
                                0.5,
                        }}
                    >
                        <Avatar
                            sx={{
                                width:
                                    38,

                                height:
                                    38,

                                bgcolor:
                                    "primary.main",

                                fontSize:
                                    "0.875rem",

                                fontWeight:
                                    700,
                            }}
                        >
                            {
                                getInitials()
                            }
                        </Avatar>


                        <Box
                            sx={{
                                minWidth:
                                    0,
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight:
                                        600,

                                    overflow:
                                        "hidden",

                                    textOverflow:
                                        "ellipsis",

                                    whiteSpace:
                                        "nowrap",
                                }}
                            >
                                {
                                    username
                                }
                            </Typography>


                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                FoodCoop MiKa
                            </Typography>
                        </Box>
                    </Stack>
                )}


                <AuthButton
                    fullWidth
                    showUsername={
                        false
                    }
                />
            </Box>
        </Box>
    );


    // =========================================================================
    // Render
    // =========================================================================

    return (
        <Box
            className={
                fixedViewportLayout
                    ? "AppShell AppShell--fixed"
                    : "AppShell"
            }
            sx={{
                minHeight:
                    "100vh",

                bgcolor:
                    "background.default",
            }}
        >
            <AppBar
                position="fixed"
                elevation={
                    0
                }
                sx={{
                    bgcolor:
                        "background.paper",

                    color:
                        "text.primary",

                    borderBottom:
                        1,

                    borderColor:
                        "divider",

                    width: {
                        lg:
                            `calc(100% - ${DRAWER_WIDTH}px)`,
                    },

                    ml: {
                        lg:
                            `${DRAWER_WIDTH}px`,
                    },
                }}
            >
                <Toolbar
                    sx={{
                        minHeight: {
                            xs:
                                64,

                            sm:
                                68,
                        },

                        px: {
                            xs:
                                1.5,

                            sm:
                                2.5,

                            lg:
                                3,
                        },
                    }}
                >
                    {!isDesktop && (
                        <IconButton
                            edge="start"
                            aria-label="Navigation öffnen"
                            onClick={() =>
                                setMobileMenuOpen(
                                    true
                                )
                            }
                            sx={{
                                mr:
                                    1,
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}


                    <Box
                        sx={{
                            flexGrow:
                                1,

                            minWidth:
                                0,
                        }}
                    >
                        <Typography
                            component="h1"
                            variant="h5"
                            sx={{
                                overflow:
                                    "hidden",

                                textOverflow:
                                    "ellipsis",

                                whiteSpace:
                                    "nowrap",
                            }}
                        >
                            {
                                getPageName()
                            }
                        </Typography>
                    </Box>


                    <Stack
                        direction="row"
                        spacing={
                            0.5
                        }
                        sx={{ alignItems: "center" }}
                    >
                        <Tooltip
                            title={
                                isLarge
                                    ? "Normale Schriftgröße"
                                    : "Größere Schrift"
                            }
                        >
                            <IconButton
                                onClick={() =>
                                    setIsLarge(
                                        current =>
                                            !current
                                    )
                                }
                            >
                                {isLarge ? (
                                    <ZoomOutOutlinedIcon />
                                ) : (
                                    <ZoomInOutlinedIcon />
                                )}
                            </IconButton>
                        </Tooltip>


                        {authenticated && (
                            <Avatar
                                sx={{
                                    ml:
                                        0.5,

                                    width:
                                        38,

                                    height:
                                        38,

                                    bgcolor:
                                        "primary.main",

                                    fontSize:
                                        "0.8125rem",

                                    fontWeight:
                                        700,
                                }}
                            >
                                {
                                    getInitials()
                                }
                            </Avatar>
                        )}
                    </Stack>
                </Toolbar>
            </AppBar>


            <Box
                component="nav"
                aria-label="Hauptnavigation"
            >
                <Drawer
                    variant="permanent"
                    open
                    sx={{
                        display: {
                            xs:
                                "none",

                            lg:
                                "block",
                        },

                        "& .MuiDrawer-paper":
                            {
                                width:
                                    DRAWER_WIDTH,

                                boxSizing:
                                    "border-box",

                                borderRight:
                                    1,

                                borderColor:
                                    "divider",
                            },
                    }}
                >
                    {
                        drawerContent
                    }
                </Drawer>


                <Drawer
                    variant="temporary"
                    open={
                        mobileMenuOpen
                    }
                    onClose={() =>
                        setMobileMenuOpen(
                            false
                        )
                    }
                    ModalProps={{
                        keepMounted:
                            true,
                    }}
                    sx={{
                        display: {
                            xs:
                                "block",

                            lg:
                                "none",
                        },

                        "& .MuiDrawer-paper":
                            {
                                width: {
                                    xs:
                                        "86vw",

                                    sm:
                                        320,
                                },

                                maxWidth:
                                    340,
                            },
                    }}
                >
                    {
                        drawerContent
                    }
                </Drawer>
            </Box>


            <Box
                component="main"
                className="AppShellContent"
                sx={{
                    ml: {
                        xs:
                            0,

                        lg:
                            `${DRAWER_WIDTH}px`,
                    },

                    /*
                     * Wichtig:
                     *
                     * Bei Bestellungen / Management ist die Main-Fläche
                     * exakt eine Viewport-Höhe hoch.
                     */
                    height:
                        fixedViewportLayout
                            ? "100vh"
                            : "auto",

                    minHeight:
                        "100vh",

                    pt: {
                        xs:
                            "64px",

                        sm:
                            "68px",
                    },

                    boxSizing:
                        "border-box",

                    overflow:
                        fixedViewportLayout
                            ? "hidden"
                            : "visible",
                }}
            >
                <Box
                    className="AppShellPage"
                    sx={{
                        width:
                            "100%",

                        maxWidth:
                            1600,

                        mx:
                            "auto",

                        px: {
                            xs:
                                1.5,

                            sm:
                                2.5,

                            md:
                                3,
                        },

                        py: {
                            xs:
                                2,

                            sm:
                                2.5,

                            md:
                                3,
                        },

                        boxSizing:
                            "border-box",

                        height:
                            fixedViewportLayout
                                ? "100%"
                                : "auto",

                        minHeight:
                            0,

                        display:
                            fixedViewportLayout
                                ? "flex"
                                : "block",

                        flexDirection:
                            "column",

                        overflow:
                            fixedViewportLayout
                                ? "hidden"
                                : "visible",
                    }}
                >
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <Home />
                            }
                        />

                        <Route
                            path={PFADE.profil}
                            element={
                                <PrivateRoute>
                                    <Profil />
                                </PrivateRoute>
                            }
                        />


                        <Route
                            path={PFADE.impressum}
                            element={
                                <About />
                            }
                        />


                        <Route
                            path={PFADE.anmelden}
                            element={
                                <AuthButton
                                    fullWidth
                                    showUsername={
                                        false
                                    }
                                />
                            }
                        />


                        {/* ================================================= */}
                        {/* Bestellung                                       */}
                        {/* ================================================= */}

                        <Route
                            path={`${PFADE.bestellung}/*`}
                            element={
                                <PrivateRoute
                                    roles={RECHTE.bestellung}
                                >
                                    <MainBestellung />
                                </PrivateRoute>
                            }
                        />


                        {/* ================================================= */}
                        {/* Einkauf                                          */}
                        {/* ================================================= */}

                        <Route
                            path={`${PFADE.einkauf}/*`}
                            element={
                                <PrivateRoute
                                    roles={RECHTE.einkauf}
                                >
                                    <MainEinkauf
                                        isLarge={
                                            isLarge
                                        }
                                    />
                                </PrivateRoute>
                            }
                        />


                        {/* ================================================= */}
                        {/* Produktmanagement                                */}
                        {/* ================================================= */}

                        <Route
                            path={`${PFADE.produkte}/*`}
                            element={
                                <PrivateRoute
                                    roles={RECHTE.produkte}
                                >
                                    <MainManagement />
                                </PrivateRoute>
                            }
                        />


                        {/* ================================================= */}
                        {/* Admin                                            */}
                        {/* ================================================= */}

                        <Route
                            path={`${PFADE.konfiguration}/*`}
                            element={
                                <PrivateRoute
                                    roles={RECHTE.konfiguration}
                                >
                                    <MainAdmin />
                                </PrivateRoute>
                            }
                        />


                        {/* ================================================= */}
                        {/* Organisation (Organisator / Admin)               */}
                        {/* ================================================= */}

                        <Route
                            path={`${PFADE.organisation}/*`}
                            element={
                                <PrivateRoute
                                    roles={RECHTE.organisation}
                                >
                                    <Organisation />
                                </PrivateRoute>
                            }
                        />


                        {/* ================================================= */}
                        {/* Verwaltung (nur Admins)                          */}
                        {/* ================================================= */}

                        <Route
                            path={`${PFADE.verwaltung}/*`}
                            element={
                                <PrivateRoute
                                    roles={RECHTE.verwaltung}
                                >
                                    <Verwaltung />
                                </PrivateRoute>
                            }
                        />


                        <Route
                            path="*"
                            element={
                                <AlteUrlWeiterleitung />
                            }
                        />
                    </Routes>
                </Box>
            </Box>
        </Box>
    );
};