import React from "react";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import ShoppingCartCheckoutOutlinedIcon
    from "@mui/icons-material/ShoppingCartCheckoutOutlined";

import {
    toast,
} from "react-toastify";

import {
    BrotTable,
} from "./BrotTable.jsx";

import {
    useApi,
} from "../ApiService.jsx";

import {
    DeadlineLogic,
} from "../deadline/DeadlineLogic.jsx";

import NumberFormatComponent
    from "../logic/NumberFormatComponent.jsx";

import {
    useAuth,
} from "../auth/AuthContext.jsx";


function extractCollection(
    result,
    embeddedKey
) {
    if (
        Array.isArray(
            result
        )
    ) {
        return result;
    }


    const embedded =
        result
            ?._embedded
            ?.[embeddedKey];


    return Array.isArray(
        embedded
    )
        ? embedded
        : [];
}


export function Brot() {
    const api =
        useApi();


    const {
        keycloak,
    } =
        useAuth();


    // =========================================================================
    // Columns
    // =========================================================================

    const columns =
        React.useMemo(
            () => [
                {
                    header:
                        "Brotname",

                    accessorKey:
                        "name",
                },
                {
                    header:
                        "Gewicht in g",

                    accessorKey:
                        "gewicht",

                    cell:
                        info => (
                            <NumberFormatComponent
                                value={
                                    info.getValue()
                                }
                                includeFractionDigits={
                                    false
                                }
                            />
                        ),
                },
                {
                    header:
                        "Preis in €",

                    accessorKey:
                        "preis",

                    cell:
                        info => (
                            <NumberFormatComponent
                                value={
                                    info.getValue()
                                }
                            />
                        ),
                },
                {
                    header:
                        "Aktuelle Bestellmenge",

                    accessorKey:
                        "bestellmengeNeu",

                    cell:
                        info => (
                            <NumberFormatComponent
                                value={
                                    Number(
                                        info.getValue() ??
                                        0
                                    )
                                }
                                includeFractionDigits={
                                    false
                                }
                            />
                        ),
                },
                {
                    id:
                        "bestellmenge",

                    header:
                        "Neue Bestellmenge",

                    enableSorting:
                        false,
                },
            ],
            []
        );


    // =========================================================================
    // State
    // =========================================================================

    const [
        products,
        setProducts,
    ] =
        React.useState([]);


    const [
        currentOrders,
        setCurrentOrders,
    ] =
        React.useState([]);


    const [
        previousOrders,
        setPreviousOrders,
    ] =
        React.useState([]);


    const [
        amounts,
        setAmounts,
    ] =
        React.useState({});


    const [
        totalPrice,
        setTotalPrice,
    ] =
        React.useState(0);


    const [
        isLoading,
        setIsLoading,
    ] =
        React.useState(true);


    const [
        submitting,
        setSubmitting,
    ] =
        React.useState(false);


    const [
        refreshCounter,
        refresh,
    ] =
        React.useReducer(
            value =>
                value + 1,

            0
        );


    const personId =
        keycloak
            ?.tokenParsed
            ?.preferred_username ??
        null;


    // =========================================================================
    // Laden
    // =========================================================================

    React.useEffect(
        () => {
            let active =
                true;


            const loadData =
                async () => {
                    if (
                        !personId
                    ) {
                        setIsLoading(
                            false
                        );

                        return;
                    }


                    setIsLoading(
                        true
                    );


                    try {
                        const [
                            productsResponse,
                            currentResponse,
                            previousResponse,
                        ] =
                            await Promise.all([
                                api.readBrotBestand(),

                                api.readBrotBestellungProPerson(
                                    personId
                                ),

                                api.readBrotBestellungBetweenDatesProPerson(
                                    personId
                                ),
                            ]);


                        if (
                            !active
                        ) {
                            return;
                        }


                        if (
                            productsResponse.ok
                        ) {
                            const result =
                                await productsResponse.json();


                            setProducts(
                                extractCollection(
                                    result,
                                    "brotBestandRepresentationList"
                                )
                            );
                        }


                        if (
                            currentResponse.ok
                        ) {
                            const result =
                                await currentResponse.json();


                            setCurrentOrders(
                                extractCollection(
                                    result,
                                    "brotBestellungRepresentationList"
                                )
                            );
                        }


                        if (
                            previousResponse.ok
                        ) {
                            const result =
                                await previousResponse.json();


                            setPreviousOrders(
                                extractCollection(
                                    result,
                                    "brotBestellungRepresentationList"
                                )
                            );
                        }
                    } catch (
                        error
                    ) {
                        console.error(
                            "Fehler beim Laden der Brotbestellung:",
                            error
                        );


                        toast.error(
                            "Die Brotbestellung konnte nicht geladen werden."
                        );
                    } finally {
                        if (
                            active
                        ) {
                            setIsLoading(
                                false
                            );
                        }
                    }
                };


            loadData();


            return () => {
                active =
                    false;
            };
        },
        [
            api,
            personId,
            refreshCounter,
        ]
    );


    // =========================================================================
    // Maps
    // =========================================================================

    const currentOrdersByProduct =
        React.useMemo(
            () =>
                new Map(
                    currentOrders
                        .filter(
                            order =>
                                order
                                    ?.brotbestand
                                    ?.id != null
                        )
                        .map(
                            order => [
                                String(
                                    order
                                        .brotbestand
                                        .id
                                ),

                                order,
                            ]
                        )
                ),
            [
                currentOrders,
            ]
        );


    const previousOrdersByProduct =
        React.useMemo(
            () =>
                new Map(
                    previousOrders
                        .filter(
                            order =>
                                order
                                    ?.brotbestand
                                    ?.id != null
                        )
                        .map(
                            order => [
                                String(
                                    order
                                        .brotbestand
                                        .id
                                ),

                                order,
                            ]
                        )
                ),
            [
                previousOrders,
            ]
        );


    // =========================================================================
    // Table Data
    // =========================================================================

    const tableData =
        React.useMemo(
            () =>
                products.map(
                    product => {
                        const id =
                            String(
                                product.id
                            );


                        return {
                            ...product,

                            bestellmengeNeu:
                                Number(
                                    currentOrdersByProduct
                                        .get(
                                            id
                                        )
                                        ?.bestellmenge ??
                                    0
                                ),

                            bestellmengeAlt:
                                previousOrdersByProduct
                                    .get(
                                        id
                                    )
                                    ?.bestellmenge ??
                                null,
                        };
                    }
                ),
            [
                products,
                currentOrdersByProduct,
                previousOrdersByProduct,
            ]
        );


    // =========================================================================
    // Absenden
    // =========================================================================

    const submitBestellung =
        async () => {
            if (
                !personId
            ) {
                toast.error(
                    "Der Benutzer konnte nicht ermittelt werden."
                );

                return;
            }


            const changedProducts =
                products.filter(
                    product =>
                        Object.prototype.hasOwnProperty.call(
                            amounts,
                            product.id
                        ) &&
                        amounts[
                            product.id
                        ] !== ""
                );


            if (
                changedProducts.length ===
                0
            ) {
                toast.info(
                    "Es wurden keine Änderungen eingegeben."
                );

                return;
            }


            setSubmitting(
                true
            );


            try {
                const calls =
                    changedProducts
                        .map(
                            product => {
                                const amount =
                                    Number(
                                        amounts[
                                            product.id
                                        ]
                                    );


                                if (
                                    Number.isNaN(
                                        amount
                                    ) ||
                                    amount <
                                        0
                                ) {
                                    throw new Error(
                                        `Ungültige Menge für ${product.name}`
                                    );
                                }


                                const existing =
                                    currentOrdersByProduct.get(
                                        String(
                                            product.id
                                        )
                                    );


                                if (
                                    existing &&
                                    amount ===
                                        0
                                ) {
                                    return api.deleteBrotBestellung(
                                        existing.id
                                    );
                                }


                                if (
                                    !existing &&
                                    amount ===
                                        0
                                ) {
                                    return null;
                                }


                                const {
                                    _links,
                                    bestellmengeNeu,
                                    bestellmengeAlt,
                                    ...backendProduct
                                } =
                                    product;


                                const order =
                                    {
                                        personId,

                                        brotbestand:
                                            {
                                                ...backendProduct,

                                                type:
                                                    "brot",
                                            },

                                        bestellmenge:
                                            amount,

                                        datum:
                                            new Date()
                                                .toISOString(),

                                        type:
                                            "brot",
                                    };


                                if (
                                    existing
                                ) {
                                    return api.updateBrotBestellung(
                                        order,
                                        existing.id
                                    );
                                }


                                return api.createBrotBestellung(
                                    order
                                );
                            }
                        )
                        .filter(
                            Boolean
                        );


                const responses =
                    await Promise.all(
                        calls
                    );


                if (
                    responses.some(
                        response =>
                            !response.ok
                    )
                ) {
                    toast.error(
                        "Die Brotbestellung konnte nicht vollständig gespeichert werden."
                    );

                    return;
                }


                toast.success(
                    "Deine Brotbestellung wurde erfolgreich gespeichert."
                );


                setAmounts(
                    {}
                );

                setTotalPrice(
                    0
                );

                refresh();
            } catch (
                error
            ) {
                console.error(
                    error
                );


                toast.error(
                    "Beim Speichern der Brotbestellung ist ein Fehler aufgetreten."
                );
            } finally {
                setSubmitting(
                    false
                );
            }
        };


    // =========================================================================
    // Render
    // =========================================================================

    return (
        <Box
            sx={{
                flex:
                    1,

                minHeight:
                    0,

                display:
                    "flex",

                flexDirection:
                    "column",

                overflow:
                    "hidden",
            }}
        >
            <Stack
                spacing={
                    2
                }
                sx={{
                    flex:
                        1,

                    minHeight:
                        0,

                    overflow:
                        "hidden",
                }}
            >
                <Box
                    sx={{
                        flexShrink:
                            0,
                    }}
                >
                    <DeadlineLogic />
                </Box>


                <Alert
                    severity="info"
                    sx={{
                        flexShrink:
                            0,
                    }}
                >
                    Deine aktuelle Bestellmenge kannst du ändern,
                    indem du eine neue Menge einträgst und anschließend
                    die Bestellung bestätigst. Mit einer Menge von 0
                    wird eine bestehende Bestellung gelöscht.
                </Alert>


                <Box
                    sx={{
                        flex:
                            1,

                        minHeight:
                            0,

                        display:
                            "flex",

                        flexDirection:
                            "column",

                        overflow:
                            "hidden",
                    }}
                >
                    {isLoading ? (
                        <Box
                            sx={{
                                flex:
                                    1,

                                display:
                                    "flex",

                                flexDirection:
                                    "column",

                                alignItems:
                                    "center",

                                justifyContent:
                                    "center",

                                gap:
                                    2,
                            }}
                        >
                            <CircularProgress />


                            <Typography>
                                Brotbestellungen werden geladen …
                            </Typography>
                        </Box>
                    ) : (
                        <BrotTable
                            columns={
                                columns
                            }
                            data={
                                tableData
                            }
                            amounts={
                                amounts
                            }
                            onAmountsChange={
                                setAmounts
                            }
                            onPriceChange={
                                setTotalPrice
                            }
                        />
                    )}
                </Box>


                <Paper
                    elevation={0}
                    sx={{
                        flexShrink:
                            0,

                        border:
                            1,

                        borderColor:
                            "divider",

                        p: {
                            xs: 1.5,
                            sm: 2,
                        },
                    }}
                >
                    <Stack
                        spacing={1.5}
                        alignItems="flex-start"
                    >
                        <Stack
                            direction="row"
                            spacing={2}
                            alignItems="baseline"
                        >
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                Preis
                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight={700}
                                sx={{
                                    fontVariantNumeric:
                                        "tabular-nums",
                                }}
                            >
                                <NumberFormatComponent
                                    value={
                                        totalPrice.toFixed(
                                            2
                                        )
                                    }
                                />{" "}
                                €
                            </Typography>
                        </Stack>


                        <Button
                            variant="contained"
                            size="large"
                            startIcon={
                                <ShoppingCartCheckoutOutlinedIcon />
                            }
                            disabled={
                                submitting ||
                                isLoading
                            }
                            onClick={
                                submitBestellung
                            }
                            sx={{
                                alignSelf:
                                    "flex-start",

                                width:
                                    "auto",

                                minWidth: {
                                    xs: 280,
                                    sm: 320,
                                },

                                maxWidth:
                                    "100%",
                            }}
                        >
                            {
                                submitting
                                    ? "Bestellung wird gespeichert …"
                                    : `Bestellung bestätigen als ${personId ?? ""}`
                            }
                        </Button>
                    </Stack>
                </Paper>
            </Stack>
        </Box>
    );
}