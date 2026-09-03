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

import ZoomInOutlinedIcon
    from "@mui/icons-material/ZoomInOutlined";

import ZoomOutOutlinedIcon
    from "@mui/icons-material/ZoomOutOutlined";

import {
    About,
} from "../About.jsx";

import {
    MainBestellung,
} from "../bestellung/MainBestellung.jsx";

import {
    Bestellung,
} from "../bestellung/Bestellung.jsx";

import {
    Brot,
} from "../brot/Brot.jsx";

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

import "./AppRouter.css";


const DRAWER_WIDTH = 270;


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
        location.pathname.startsWith(
            "/mainBestellung"
        ) ||
        location.pathname.startsWith(
            "/mainManagement"
        );


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

    const navigationItems =
        useMemo(
            () => [
                {
                    label:
                        "Home",

                    path:
                        "/home",

                    icon:
                        <HomeOutlinedIcon />,
                },
                {
                label:
                    "Mein Profil",

                path:
                    "/profil",

                icon:
                    <AccountCircleOutlinedIcon />,
            },
                {
                    label:
                        "Bestellung",

                    path:
                        "/mainBestellung",

                    icon:
                        <AddShoppingCartOutlinedIcon />,
                },
                {
                    label:
                        "Einkauf",

                    path:
                        "/mainEinkauf",

                    icon:
                        <ShoppingCartOutlinedIcon />,
                },
                {
                    label:
                        "Produkt-Management",

                    path:
                        "/mainManagement",

                    icon:
                        <Inventory2OutlinedIcon />,
                },
                {
                    label:
                        "Konfiguration",

                    path:
                        "/mainAdmin",

                    icon:
                        <SettingsOutlinedIcon />,
                },
            ],
            []
        );


    const secondaryNavigationItems =
        useMemo(
            () => [
                {
                    label:
                        "Impressum",

                    path:
                        "/about",

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
            currentRoute.startsWith(
                "/mainBestellung"
            )
        ) {
            return "Bestellung";
        }
if (
            currentRoute.startsWith(
                "/profil"
            )
        ) {
            return "Mein Profil";
        }

        if (
            currentRoute.startsWith(
                "/mainEinkauf"
            )
        ) {
            return "Einkauf";
        }


        if (
            currentRoute.startsWith(
                "/mainManagement"
            )
        ) {
            return "Produkt-Management";
        }


        if (
            currentRoute.startsWith(
                "/mainAdmin"
            )
        ) {
            return "Konfiguration";
        }


        if (
            currentRoute.startsWith(
                "/about"
            )
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
    ) => {
        if (
            path === "/home"
        ) {
            return (
                location.pathname ===
                    "/" ||
                location.pathname ===
                    "/home"
            );
        }


        return location.pathname
            .startsWith(
                path
            );
    };


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
                    sx={{
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
                        primaryTypographyProps={{
                            fontSize:
                                "0.9375rem",

                            fontWeight:
                                active
                                    ? 650
                                    : 500,
                        }}
                    />
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
                to="/home"
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
                {authenticated ? (
                    <List
                        disablePadding
                    >
                        {
                            navigationItems.map(
                                renderNavigationItem
                            )
                        }
                    </List>
                ) : (
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
                        alignItems="center"
                        sx={{
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
            className="AppShell"
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
                        alignItems="center"
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
                            path="/profil"
                            element={
                                <PrivateRoute>
                                    <Profil />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/home"
                            element={
                                <Home />
                            }
                        />


                        <Route
                            path="/about"
                            element={
                                <About />
                            }
                        />


                        <Route
                            path="/login"
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
                            path="/mainBestellung"
                            element={
                                <PrivateRoute
                                    roles={[
                                        "Einkäufer",
                                    ]}
                                >
                                    <MainBestellung />
                                </PrivateRoute>
                            }
                        >
                            <Route
                                index
                                element={
                                    <Navigate
                                        to="bestellung"
                                        replace
                                    />
                                }
                            />


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
                        </Route>


                        {/* ================================================= */}
                        {/* Einkauf                                          */}
                        {/* ================================================= */}

                        <Route
                            path="/mainEinkauf/*"
                            element={
                                <PrivateRoute
                                    roles={[
                                        "Einkäufer",
                                    ]}
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
                            path="/mainManagement/*"
                            element={
                                <PrivateRoute
                                    roles={[
                                        "Einkäufer",
                                    ]}
                                >
                                    <MainManagement />
                                </PrivateRoute>
                            }
                        />


                        {/* ================================================= */}
                        {/* Admin                                            */}
                        {/* ================================================= */}

                        <Route
                            path="/mainAdmin/*"
                            element={
                                <PrivateRoute
                                    roles={[
                                        "Einkäufer",
                                    ]}
                                >
                                    <MainAdmin />
                                </PrivateRoute>
                            }
                        />


                        <Route
                            path="*"
                            element={
                                <Navigate
                                    to="/home"
                                    replace
                                />
                            }
                        />
                    </Routes>
                </Box>
            </Box>
        </Box>
    );
};