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
    BestellungTable,
} from "./BestellungTable.jsx";

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


// =============================================================================
// Collection aus neuem oder altem Backend extrahieren
// =============================================================================

function extractCollection(
    result,
    embeddedKey
) {
    if (
        Array.isArray(result)
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


// =============================================================================
// Frischbestand-Request erzeugen
// =============================================================================
//
// Ganz wichtig:
//
// Wir verwenden hier absichtlich NICHT:
//
//     {
//         ...product
//     }
//
// Denn dadurch würden alte / zusätzliche Felder aus dem Backend wieder
// zurückgesendet.
//
// Genau darunter kann aktuell noch ein Boolean-Feld mit null liegen.
//
// Stattdessen schicken wir nur die Felder, die ein Frischprodukt wirklich
// benötigt.
//
// =============================================================================

function createFrischBestandRequest(
    product
) {
    return {
        id:
            product.id,

        name:
            product.name ?? "",

        preis:
            Number(
                product.preis ?? 0
            ),

        verfuegbarkeit:
            product.verfuegbarkeit ===
            true,

        herkunftsland:
            product.herkunftsland ??
            "",

        verband:
            product.verband ??
            "",

        gebindegroesse:
            Number(
                product.gebindegroesse ??
                0
            ),

        spezialfallBestelleinheit:
            product
                .spezialfallBestelleinheit ===
            true,

        type:
            "frisch",


        // ---------------------------------------------------------------------
        // Einheit
        // ---------------------------------------------------------------------

        einheit:
            product.einheit
                ? {
                    id:
                        product
                            .einheit
                            .id,

                    name:
                        product
                            .einheit
                            .name ??
                        "",
                }
                : null,


        // ---------------------------------------------------------------------
        // Kategorie
        // ---------------------------------------------------------------------

        kategorie:
            product.kategorie
                ? {
                    id:
                        product
                            .kategorie
                            .id,

                    name:
                        product
                            .kategorie
                            .name ??
                        "",

                    mixable:
                        product
                            .kategorie
                            .mixable ===
                        true,
                }
                : null,
    };
}


// =============================================================================
// Bestellung
// =============================================================================

export function Bestellung() {
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
                        "Produkt",

                    accessorKey:
                        "name",
                },

                {
                    header:
                        "Land",

                    accessorKey:
                        "herkunftsland",
                },

                {
                    header:
                        "Verband",

                    accessorKey:
                        "verband",
                },

                {
                    header:
                        "Kategorie",

                    accessorKey:
                        "kategorie.name",
                },

                {
                    id:
                        "preis",

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
                        "Gebindegröße",

                    accessorKey:
                        "gebindegroesse",

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
                        "Bestellmenge alle Mitglieder",

                    accessorKey:
                        "bestellsumme",

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

                {
                    header:
                        "Einheit",

                    accessorKey:
                        "einheit.name",
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
        orderTotals,
        setOrderTotals,
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
    // Daten laden
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
                            totalsResponse,
                            productsResponse,
                            currentResponse,
                            previousResponse,
                        ] =
                            await Promise.all([
                                api
                                    .readFrischBestellungProProdukt(),

                                api
                                    .readFrischBestand(),

                                api
                                    .readFrischBestellungProPerson(
                                        personId
                                    ),

                                api
                                    .readFrischBestellungBetweenDatesProPerson(
                                        personId
                                    ),
                            ]);


                        if (
                            !active
                        ) {
                            return;
                        }


                        // =====================================================
                        // Gesamtsummen
                        // =====================================================

                        if (
                            totalsResponse.ok
                        ) {
                            const result =
                                await totalsResponse
                                    .json();


                            setOrderTotals(
                                extractCollection(
                                    result,
                                    "frischBestellungRepresentationList"
                                )
                            );
                        } else {
                            console.error(
                                "[Bestellung] Bestellsummen:",
                                totalsResponse
                                    .status
                            );
                        }


                        // =====================================================
                        // Frischbestand
                        // =====================================================

                        if (
                            productsResponse.ok
                        ) {
                            const result =
                                await productsResponse
                                    .json();


                            setProducts(
                                extractCollection(
                                    result,
                                    "frischBestandRepresentationList"
                                )
                            );
                        } else {
                            console.error(
                                "[Bestellung] Frischbestand:",
                                productsResponse
                                    .status
                            );
                        }


                        // =====================================================
                        // Eigene aktuelle Bestellung
                        // =====================================================

                        if (
                            currentResponse.ok
                        ) {
                            const result =
                                await currentResponse
                                    .json();


                            setCurrentOrders(
                                extractCollection(
                                    result,
                                    "frischBestellungRepresentationList"
                                )
                            );
                        } else {
                            console.error(
                                "[Bestellung] Aktuelle Bestellung:",
                                currentResponse
                                    .status
                            );
                        }


                        // =====================================================
                        // Vorwoche
                        // =====================================================

                        if (
                            previousResponse.ok
                        ) {
                            const result =
                                await previousResponse
                                    .json();


                            setPreviousOrders(
                                extractCollection(
                                    result,
                                    "frischBestellungRepresentationList"
                                )
                            );
                        } else {
                            console.error(
                                "[Bestellung] Vorwochenbestellung:",
                                previousResponse
                                    .status
                            );
                        }
                    } catch (
                        error
                    ) {
                        console.error(
                            "Fehler beim Laden der Frischbestellung:",
                            error
                        );


                        toast.error(
                            "Die Frischbestellung konnte nicht vollständig geladen werden."
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
    // Aktuelle Bestellungen nach Produkt
    // =========================================================================

    const currentOrdersByProduct =
        React.useMemo(
            () =>
                new Map(
                    currentOrders
                        .filter(
                            order =>
                                order
                                    ?.frischbestand
                                    ?.id !=
                                null
                        )
                        .map(
                            order => [
                                String(
                                    order
                                        .frischbestand
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


    // =========================================================================
    // Vorwoche nach Produkt
    // =========================================================================

    const previousOrdersByProduct =
        React.useMemo(
            () =>
                new Map(
                    previousOrders
                        .filter(
                            order =>
                                order
                                    ?.frischbestand
                                    ?.id !=
                                null
                        )
                        .map(
                            order => [
                                String(
                                    order
                                        .frischbestand
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
    // Gesamtsumme nach Produkt
    // =========================================================================

    const totalsByProduct =
        React.useMemo(
            () =>
                new Map(
                    orderTotals
                        .filter(
                            order =>
                                order
                                    ?.frischbestand
                                    ?.id !=
                                null
                        )
                        .map(
                            order => [
                                String(
                                    order
                                        .frischbestand
                                        .id
                                ),

                                order,
                            ]
                        )
                ),
            [
                orderTotals,
            ]
        );


    // =========================================================================
    // Tabellen-Daten
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

                            bestellsumme:
                                Number(
                                    totalsByProduct
                                        .get(id)
                                        ?.bestellmenge ??
                                    0
                                ),

                            bestellmengeNeu:
                                Number(
                                    currentOrdersByProduct
                                        .get(id)
                                        ?.bestellmenge ??
                                    0
                                ),

                            bestellmengeAlt:
                                previousOrdersByProduct
                                    .get(id)
                                    ?.bestellmenge ??
                                null,
                        };
                    }
                ),
            [
                products,
                totalsByProduct,
                currentOrdersByProduct,
                previousOrdersByProduct,
            ]
        );


    // =========================================================================
    // Bestellung absenden
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


            // Nur Produkte berücksichtigen,
            // bei denen tatsächlich etwas eingegeben wurde.

            const changedProducts =
                products.filter(
                    product =>
                        Object.prototype
                            .hasOwnProperty
                            .call(
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
                    [];


                for (
                    const product
                    of changedProducts
                ) {
                    const amount =
                        Number(
                            amounts[
                                product.id
                            ]
                        );


                    // =========================================================
                    // Eingabe prüfen
                    // =========================================================

                    if (
                        Number.isNaN(
                            amount
                        ) ||
                        amount < 0
                    ) {
                        throw new Error(
                            `Ungültige Bestellmenge für "${product.name}".`
                        );
                    }


                    const existing =
                        currentOrdersByProduct
                            .get(
                                String(
                                    product.id
                                )
                            );


                    // =========================================================
                    // Bestehende Bestellung löschen
                    // =========================================================

                    if (
                        existing &&
                        amount === 0
                    ) {
                        calls.push(
                            api
                                .deleteFrischBestellung(
                                    existing.id
                                )
                        );

                        continue;
                    }


                    // =========================================================
                    // 0 ohne bestehende Bestellung
                    // =========================================================

                    if (
                        !existing &&
                        amount === 0
                    ) {
                        continue;
                    }


                    // =========================================================
                    // Sauberes Frischbestand-Objekt
                    // =========================================================

                    const frischbestand =
                        createFrischBestandRequest(
                            product
                        );


                    // =========================================================
                    // Bestellung
                    // =========================================================

                    const order = {
                        personId,

                        frischbestand,

                        bestellmenge:
                            amount,

                        datum:
                            new Date()
                                .toISOString(),

                        done:
                            false,

                        type:
                            "frisch",
                    };


                    console.log(
                        "[Bestellung] Request JSON:",
                        JSON.stringify(
                            order,
                            null,
                            2
                        )
                    );


                    // =========================================================
                    // Update
                    // =========================================================

                    if (
                        existing
                    ) {
                        calls.push(
                            api
                                .updateFrischBestellung(
                                    order,
                                    existing.id
                                )
                        );

                        continue;
                    }


                    // =========================================================
                    // Create
                    // =========================================================

                    calls.push(
                        api
                            .createFrischBestellung(
                                order
                            )
                    );
                }


                // =============================================================
                // Keine Requests
                // =============================================================

                if (
                    calls.length ===
                    0
                ) {
                    toast.info(
                        "Es waren keine Änderungen zu speichern."
                    );


                    setAmounts(
                        {}
                    );


                    setTotalPrice(
                        0
                    );


                    return;
                }


                // =============================================================
                // Requests senden
                // =============================================================

                const responses =
                    await Promise.all(
                        calls
                    );


                const failedResponses =
                    responses.filter(
                        response =>
                            !response.ok
                    );


                // =============================================================
                // Backendfehler
                // =============================================================

                if (
                    failedResponses.length >
                    0
                ) {
                    for (
                        const response
                        of failedResponses
                    ) {
                        let text =
                            "";


                        try {
                            text =
                                await response
                                    .text();
                        } catch {
                            // keine weitere Aktion
                        }


                        console.error(
                            "[Bestellung] Backendfehler:",
                            response.status,
                            text
                        );
                    }


                    toast.error(
                        "Die Bestellung konnte nicht vollständig gespeichert werden."
                    );

                    return;
                }


                // =============================================================
                // Erfolg
                // =============================================================

                toast.success(
                    "Deine Bestellung wurde erfolgreich gespeichert."
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
                    "[Bestellung] Fehler beim Speichern:",
                    error
                );


                toast.error(
                    error?.message ??
                    "Beim Speichern der Bestellung ist ein Fehler aufgetreten."
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
                flex: 1,
                minHeight: 0,

                display:
                    "flex",

                flexDirection:
                    "column",

                overflow:
                    "hidden",
            }}
        >
            <Stack
                spacing={2}
                sx={{
                    flex: 1,
                    minHeight: 0,

                    overflow:
                        "hidden",
                }}
            >
                <Box
                    sx={{
                        flexShrink: 0,
                    }}
                >
                    <DeadlineLogic />
                </Box>


                <Alert
                    severity="info"
                    sx={{
                        flexShrink: 0,
                    }}
                >
                    Deine aktuelle Bestellmenge kannst du ändern,
                    indem du eine neue Menge einträgst und anschließend
                    die Bestellung bestätigst. Mit einer Menge von 0
                    wird eine bestehende Bestellung gelöscht.
                </Alert>


                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,

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
                                flex: 1,

                                display:
                                    "flex",

                                flexDirection:
                                    "column",

                                alignItems:
                                    "center",

                                justifyContent:
                                    "center",

                                gap: 2,
                            }}
                        >
                            <CircularProgress />


                            <Typography>
                                Frischprodukte werden geladen …
                            </Typography>
                        </Box>
                    ) : (
                        <BestellungTable
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
                        flexShrink: 0,

                        border: 1,
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
                                        totalPrice
                                            .toFixed(
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
                                    xs:
                                        280,
                                    sm:
                                        320,
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