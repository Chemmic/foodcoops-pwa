import React from "react";

import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import AddBoxOutlinedIcon
    from "@mui/icons-material/AddBoxOutlined";

import {
    toast,
} from "react-toastify";

import {
    useApi,
} from "../ApiService.jsx";

import {
    BrotBestandTable,
} from "./BrotBestandTable.jsx";

import {
    EditBrotBestandModal,
} from "./EditBrotBestandModal.jsx";

import {
    NewBrotBestandModal,
} from "./NewBrotBestandModal.jsx";

import NumberFormatComponent
    from "../logic/NumberFormatComponent.jsx";


export function BrotBestandManagement() {
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
                        "Verfügbarkeit",

                    accessorKey:
                        "verfuegbarkeit",
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
            ],
            []
        );


    // =========================================================================
    // State
    // =========================================================================

    const [
        isLoading,
        setIsLoading,
    ] =
        React.useState(
            true
        );


    const [
        data,
        setData,
    ] =
        React.useState(
            []
        );


    const [
        refreshCounter,
        refresh,
    ] =
        React.useReducer(
            value =>
                value + 1,
            0
        );


    const [
        modal,
        setModal,
    ] =
        React.useState({
            type:
                null,

            entity:
                null,
        });


    const api =
        useApi();


    // =========================================================================
    // Brotbestand laden
    // =========================================================================

    React.useEffect(
        () => {
            let active =
                true;


            const loadData =
                async () => {
                    setIsLoading(
                        true
                    );


                    try {
                        const response =
                            await api.readBrotBestand();


                        if (
                            !response.ok
                        ) {
                            throw new Error(
                                `HTTP ${response.status}`
                            );
                        }


                        const result =
                            await response.json();


                        if (
                            !active
                        ) {
                            return;
                        }


                        // =====================================================
                        // Unterstützt beide Backend-Formate
                        // =====================================================

                        const products =
                            Array.isArray(
                                result
                            )
                                ? result
                                : result
                                    ?._embedded
                                    ?.brotBestandRepresentationList ??
                                [];


                        setData(
                            Array.isArray(
                                products
                            )
                                ? products
                                : []
                        );
                    } catch (
                        error
                    ) {
                        console.error(
                            "Brotbestand konnte nicht geladen werden:",
                            error
                        );


                        if (
                            active
                        ) {
                            setData(
                                []
                            );


                            toast.error(
                                "Der Brotbestand konnte nicht geladen werden."
                            );
                        }
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
            refreshCounter,
        ]
    );


    // =========================================================================
    // Modal
    // =========================================================================

    const dispatchModal = (
        type,
        entity = null
    ) => {
        setModal({
            type,
            entity,
        });
    };


    // =========================================================================
    // Brotbestand bearbeiten
    // =========================================================================

    const persistBrotBestand =
        async (
            brotBestand,
            patch
        ) => {
            if (
                !brotBestand
            ) {
                toast.error(
                    "Das zu bearbeitende Produkt wurde nicht gefunden."
                );

                return;
            }


            const changedData = {
                ...brotBestand,
            };


            for (
                const [
                    accessor,
                    {
                        value,
                    },
                ] of Object.entries(
                    patch
                )
            ) {
                if (
                    accessor ===
                        "preis" ||
                    accessor ===
                        "gewicht"
                ) {
                    changedData[
                        accessor
                    ] =
                        Number(
                            value
                        ) || 0;
                } else if (
                    accessor ===
                    "verfuegbarkeit"
                ) {
                    changedData[
                        accessor
                    ] =
                        Boolean(
                            value
                        );
                } else {
                    changedData[
                        accessor
                    ] =
                        value;
                }
            }


            changedData.type =
                "brot";


            delete changedData
                ._links;


            try {
                const response =
                    await api.updateBrotBestand(
                        brotBestand.id,
                        changedData
                    );


                if (
                    !response.ok
                ) {
                    toast.error(
                        `Das Produkt „${brotBestand.name}“ konnte nicht aktualisiert werden. Bitte prüfe die Eingaben.`
                    );

                    return;
                }


                toast.success(
                    `Das Produkt „${brotBestand.name}“ wurde aktualisiert.`
                );


                refresh();
            } catch (
                error
            ) {
                console.error(
                    "Fehler beim Aktualisieren des Brotprodukts:",
                    error
                );


                toast.error(
                    `Beim Aktualisieren von „${brotBestand.name}“ ist ein Fehler aufgetreten.`
                );
            }
        };


    // =========================================================================
    // Brotbestand löschen
    // =========================================================================

    const deleteBrotBestand =
        async brotBestand => {
            if (
                !brotBestand
            ) {
                toast.error(
                    "Das zu löschende Produkt wurde nicht gefunden."
                );

                return;
            }


            try {
                const response =
                    await api.deleteBrotBestand(
                        brotBestand.id
                    );


                if (
                    !response.ok
                ) {
                    toast.error(
                        `Das Produkt „${brotBestand.name}“ konnte nicht gelöscht werden. Möglicherweise existieren noch Bestellungen dafür.`
                    );

                    return;
                }


                setData(
                    current =>
                        current.filter(
                            product =>
                                product.id !==
                                brotBestand.id
                        )
                );


                toast.success(
                    `Das Produkt „${brotBestand.name}“ wurde gelöscht.`
                );
            } catch (
                error
            ) {
                console.error(
                    "Fehler beim Löschen des Brotprodukts:",
                    error
                );


                toast.error(
                    `Beim Löschen von „${brotBestand.name}“ ist ein Fehler aufgetreten.`
                );
            }
        };


    // =========================================================================
    // Neues Brotprodukt
    // =========================================================================

    const newBrotBestand =
        async newData => {
            const requestData = {
                ...newData,

                type:
                    "brot",

                verfuegbarkeit:
                    Boolean(
                        newData.verfuegbarkeit
                    ),

                preis:
                    Number(
                        newData.preis ??
                        0
                    ),

                gewicht:
                    Number(
                        newData.gewicht ??
                        0
                    ),
            };


            try {
                const response =
                    await api.createBrotBestand(
                        requestData
                    );


                if (
                    !response.ok
                ) {
                    toast.error(
                        `Das Produkt „${requestData.name}“ konnte nicht erstellt werden.`
                    );

                    return;
                }


                const created =
                    await response.json();


                setData(
                    current => [
                        ...current,
                        created,
                    ]
                );


                toast.success(
                    `Das Produkt „${requestData.name}“ wurde erstellt.`
                );
            } catch (
                error
            ) {
                console.error(
                    "Fehler beim Erstellen des Brotprodukts:",
                    error
                );


                toast.error(
                    `Beim Erstellen von „${requestData.name}“ ist ein Fehler aufgetreten.`
                );
            }
        };


    // =========================================================================
    // Render
    // =========================================================================

    return (
        <Stack
            spacing={{
                xs:
                    1.5,

                sm:
                    2,
            }}
            sx={{
                width:
                    "100%",

                flex:
                    1,

                minHeight:
                    0,

                height: {
                    xs:
                        "auto",

                    lg:
                        "100%",
                },

                overflow: {
                    xs:
                        "visible",

                    lg:
                        "hidden",
                },
            }}
        >
            {/* ============================================================= */}
            {/* Überschrift                                                   */}
            {/* ============================================================= */}

            <Box
                sx={{
                    flexShrink:
                        0,
                }}
            >
                <Typography
                    variant="h2"
                    gutterBottom
                    sx={{
                        fontSize: {
                            xs:
                                "1.5rem",

                            sm:
                                undefined,
                        },

                        lineHeight: {
                            xs:
                                1.2,

                            sm:
                                undefined,
                        },

                        mb: {
                            xs:
                                0.5,

                            sm:
                                1,
                        },
                    }}
                >
                    Brotbestand
                </Typography>


                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                        lineHeight: {
                            xs:
                                1.45,

                            sm:
                                1.5,
                        },
                    }}
                >
                    Brotprodukte, Preise, Gewichte, Verfügbarkeit
                    und Allergeninformationen verwalten.
                </Typography>
            </Box>


            {/* ============================================================= */}
            {/* Aktionen                                                      */}
            {/* ============================================================= */}

            <Paper
                elevation={0}
                sx={{
                    flexShrink:
                        0,

                    p: {
                        xs:
                            1.25,

                        sm:
                            2,
                    },

                    border:
                        1,

                    borderColor:
                        "divider",

                    borderRadius:
                        2,
                }}
            >
                <Button
                    variant="contained"
                    startIcon={
                        <AddBoxOutlinedIcon />
                    }
                    onClick={() =>
                        dispatchModal(
                            "NewBrotBestandModal"
                        )
                    }
                    sx={{
                        width: {
                            xs:
                                "100%",

                            sm:
                                "auto",
                        },

                        minHeight: {
                            xs:
                                44,

                            sm:
                                40,
                        },
                    }}
                >
                    Brotprodukt erstellen
                </Button>
            </Paper>


            {/* ============================================================= */}
            {/* Tabelle                                                       */}
            {/* ============================================================= */}

            <Box
                sx={{
                    flex:
                        1,

                    minHeight:
                        0,

                    width:
                        "100%",

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

                            minHeight:
                                0,

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


                        <Typography
                            color="text.secondary"
                        >
                            Brotbestand wird geladen …
                        </Typography>
                    </Box>
                ) : (
                    <BrotBestandTable
                        columns={
                            columns
                        }
                        data={
                            data
                        }
                        dispatchModal={
                            dispatchModal
                        }
                    />
                )}
            </Box>


            {/* ============================================================= */}
            {/* Modals                                                        */}
            {/* ============================================================= */}

            <EditBrotBestandModal
                show={
                    modal.type ===
                    "EditBrotBestandModal"
                }
                close={() =>
                    dispatchModal(
                        null
                    )
                }
                persist={
                    persistBrotBestand
                }
                deleteBrotBestand={
                    deleteBrotBestand
                }
                produkt={
                    modal.entity
                }
            />


            <NewBrotBestandModal
                show={
                    modal.type ===
                    "NewBrotBestandModal"
                }
                close={() =>
                    dispatchModal(
                        null
                    )
                }
                create={
                    newBrotBestand
                }
            />
        </Stack>
    );
}