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

import CategoryOutlinedIcon
    from "@mui/icons-material/CategoryOutlined";

import StraightenOutlinedIcon
    from "@mui/icons-material/StraightenOutlined";

import {
    toast,
} from "react-toastify";

import {
    deepAssign,
    deepClone,
} from "../util";

import {
    useApi,
} from "../ApiService.jsx";

import {
    FrischBestandTable,
} from "./FrischBestandTable.jsx";

import {
    EditFrischBestandModal,
} from "./EditFrischBestandModal.jsx";

import {
    NewFrischBestandModal,
} from "./NewFrischBestandModal.jsx";

import {
    EditKategorieModal,
} from "../lager/EditKategorieModal.jsx";

import {
    EditEinheitenModal,
} from "../lager/EditEinheitenModal.jsx";

import NumberFormatComponent
    from "../logic/NumberFormatComponent.jsx";


export function FrischBestandManagement() {
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
                        "Verfügbarkeit",

                    accessorKey:
                        "verfuegbarkeit",
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
                        "Kategorie",

                    accessorKey:
                        "kategorie.name",
                },

                {
                    header:
                        "Einheit",

                    accessorKey:
                        "einheit.name",
                },

                {
                    header:
                        "Spezialfall Bestelleinheit",

                    accessorKey:
                        "spezialfallBestelleinheit",
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
        einheiten,
        setEinheiten,
    ] =
        React.useState(
            []
        );


    const [
        kategorien,
        setKategorien,
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
    // Backend Response vereinheitlichen
    // =========================================================================

    const extractArray = (
        response,
        embeddedKey
    ) => {
        if (
            Array.isArray(
                response
            )
        ) {
            return response;
        }


        return (
            response
                ?._embedded
                ?.[embeddedKey] ??
            []
        );
    };


    // =========================================================================
    // Daten laden
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
                        const [
                            frischResponse,
                            einheitResponse,
                            kategorieResponse,
                        ] =
                            await Promise.all(
                                [
                                    api.readFrischBestand(),
                                    api.readEinheit(),
                                    api.readKategorie(),
                                ]
                            );


                        if (
                            !active
                        ) {
                            return;
                        }


                        if (
                            !frischResponse.ok
                        ) {
                            throw new Error(
                                `Frischbestand: HTTP ${frischResponse.status}`
                            );
                        }


                        if (
                            !einheitResponse.ok
                        ) {
                            throw new Error(
                                `Einheiten: HTTP ${einheitResponse.status}`
                            );
                        }


                        if (
                            !kategorieResponse.ok
                        ) {
                            throw new Error(
                                `Kategorien: HTTP ${kategorieResponse.status}`
                            );
                        }


                        const [
                            frischResult,
                            einheitResult,
                            kategorieResult,
                        ] =
                            await Promise.all(
                                [
                                    frischResponse.json(),
                                    einheitResponse.json(),
                                    kategorieResponse.json(),
                                ]
                            );


                        if (
                            !active
                        ) {
                            return;
                        }


                        setData(
                            extractArray(
                                frischResult,
                                "frischBestandRepresentationList"
                            )
                        );


                        setEinheiten(
                            extractArray(
                                einheitResult,
                                "einheitRepresentationList"
                            )
                        );


                        setKategorien(
                            extractArray(
                                kategorieResult,
                                "kategorieRepresentationList"
                            )
                        );
                    } catch (
                        error
                    ) {
                        console.error(
                            "Fehler beim Laden des Frischbestands:",
                            error
                        );


                        if (
                            active
                        ) {
                            toast.error(
                                "Die Frischbestandsdaten konnten nicht vollständig geladen werden."
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
    // Frischprodukt aktualisieren
    // =========================================================================

    const persistFrischBestand =
        async (
            frischBestand,
            patch
        ) => {
            if (
                !frischBestand
            ) {
                return;
            }


            const changedData =
                deepClone(
                    frischBestand
                );


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
                deepAssign(
                    accessor,
                    changedData,
                    value
                );
            }


            changedData.type =
                "frisch";


            delete changedData
                ._links;


            try {
                const response =
                    await api.updateFrischBestand(
                        frischBestand.id,
                        changedData
                    );


                if (
                    response.ok
                ) {
                    toast.success(
                        `Das Produkt „${frischBestand.name}“ wurde erfolgreich aktualisiert.`
                    );


                    refresh();

                    return;
                }


                toast.error(
                    `Das Produkt „${frischBestand.name}“ konnte nicht aktualisiert werden. Bitte prüfe die Eingaben.`
                );
            } catch (
                error
            ) {
                console.error(
                    "Fehler beim Aktualisieren des Frischprodukts:",
                    error
                );


                toast.error(
                    `Beim Aktualisieren von „${frischBestand.name}“ ist ein Fehler aufgetreten.`
                );
            }
        };


    // =========================================================================
    // Frischprodukt löschen
    // =========================================================================

    const deleteFrischBestand =
        async frischBestand => {
            if (
                !frischBestand
            ) {
                return;
            }


            try {
                const response =
                    await api.deleteFrischBestand(
                        frischBestand.id
                    );


                if (
                    !response.ok
                ) {
                    toast.error(
                        `Das Produkt „${frischBestand.name}“ konnte nicht gelöscht werden. Möglicherweise existieren bereits Bestellungen dafür.`
                    );

                    return;
                }


                setData(
                    previous =>
                        previous.filter(
                            product =>
                                product.id !==
                                frischBestand.id
                        )
                );


                toast.success(
                    `Das Produkt „${frischBestand.name}“ wurde gelöscht.`
                );
            } catch (
                error
            ) {
                console.error(
                    "Fehler beim Löschen des Frischprodukts:",
                    error
                );


                toast.error(
                    `Beim Löschen von „${frischBestand.name}“ ist ein Fehler aufgetreten.`
                );
            }
        };


    // =========================================================================
    // Frischprodukt erstellen
    // =========================================================================

    const newFrischBestand =
        async productData => {
            const dataToCreate = {
                ...productData,

                type:
                    "frisch",
            };


            try {
                const response =
                    await api.createFrischBestand(
                        dataToCreate
                    );


                if (
                    !response.ok
                ) {
                    toast.error(
                        `Das Produkt „${dataToCreate.name}“ konnte nicht erstellt werden.`
                    );

                    return;
                }


                const created =
                    await response.json();


                setData(
                    previous => [
                        ...previous,
                        created,
                    ]
                );


                toast.success(
                    `Das Produkt „${dataToCreate.name}“ wurde erstellt.`
                );
            } catch (
                error
            ) {
                console.error(
                    "Fehler beim Erstellen des Frischprodukts:",
                    error
                );


                toast.error(
                    `Das Produkt „${dataToCreate.name}“ konnte nicht erstellt werden.`
                );
            }
        };


    // =========================================================================
    // Kategorie
    // =========================================================================

    const newKategorie =
        async ({
            icon,
            name,
            mixable,
        }) => {
            try {
                const response =
                    await api.createKategorie(
                        name,
                        icon,
                        mixable
                    );


                if (
                    !response.ok
                ) {
                    toast.error(
                        `Die Kategorie „${name}“ konnte nicht erstellt werden.`
                    );

                    return;
                }


                const created =
                    await response.json();


                setKategorien(
                    previous => [
                        created,
                        ...previous,
                    ]
                );


                toast.success(
                    `Die Kategorie „${name}“ wurde erstellt.`
                );
            } catch (
                error
            ) {
                console.error(
                    "Fehler beim Erstellen der Kategorie:",
                    error
                );


                toast.error(
                    `Die Kategorie „${name}“ konnte nicht erstellt werden.`
                );
            }
        };


    const deleteKategorie =
        async ({
            id,
            name,
        }) => {
            try {
                const response =
                    await api.deleteKategorie(
                        id
                    );


                if (
                    !response.ok
                ) {
                    toast.error(
                        "Die Kategorie konnte nicht gelöscht werden. Möglicherweise wird sie noch von einem Frischprodukt oder Lagerprodukt verwendet."
                    );

                    return;
                }


                setKategorien(
                    previous =>
                        previous.filter(
                            category =>
                                category.id !==
                                id
                        )
                );


                toast.success(
                    name
                        ? `Die Kategorie „${name}“ wurde gelöscht.`
                        : "Die Kategorie wurde gelöscht."
                );
            } catch (
                error
            ) {
                console.error(
                    "Fehler beim Löschen der Kategorie:",
                    error
                );


                toast.error(
                    "Beim Löschen der Kategorie ist ein Fehler aufgetreten."
                );
            }
        };


    // =========================================================================
    // Einheit
    // =========================================================================

    const newEinheit =
        async ({
            name,
        }) => {
            try {
                const response =
                    await api.createEinheit(
                        name
                    );


                if (
                    !response.ok
                ) {
                    toast.error(
                        `Die Einheit „${name}“ konnte nicht erstellt werden.`
                    );

                    return;
                }


                const created =
                    await response.json();


                setEinheiten(
                    previous => [
                        created,
                        ...previous,
                    ]
                );


                toast.success(
                    `Die Einheit „${name}“ wurde erstellt.`
                );
            } catch (
                error
            ) {
                console.error(
                    "Fehler beim Erstellen der Einheit:",
                    error
                );


                toast.error(
                    `Die Einheit „${name}“ konnte nicht erstellt werden.`
                );
            }
        };


    const deleteEinheit =
        async ({
            id,
            name,
        }) => {
            try {
                const response =
                    await api.deleteEinheit(
                        id
                    );


                if (
                    !response.ok
                ) {
                    toast.error(
                        "Die Einheit konnte nicht gelöscht werden. Möglicherweise wird sie noch von einem Produkt verwendet."
                    );

                    return;
                }


                setEinheiten(
                    previous =>
                        previous.filter(
                            unit =>
                                unit.id !==
                                id
                        )
                );


                toast.success(
                    name
                        ? `Die Einheit „${name}“ wurde gelöscht.`
                        : "Die Einheit wurde gelöscht."
                );
            } catch (
                error
            ) {
                console.error(
                    "Fehler beim Löschen der Einheit:",
                    error
                );


                toast.error(
                    "Beim Löschen der Einheit ist ein Fehler aufgetreten."
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
            {/* Kopf                                                          */}
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
                    Frischbestand
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
                    Frischprodukte, Verfügbarkeit, Gebindegrößen,
                    Kategorien und Einheiten verwalten.
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
                <Box
                    sx={{
                        display:
                            "grid",

                        gridTemplateColumns: {
                            xs:
                                "repeat(2, minmax(0, 1fr))",

                            sm:
                                "repeat(3, auto)",
                        },

                        gap:
                            1,

                        alignItems:
                            "stretch",

                        justifyContent: {
                            sm:
                                "flex-start",
                        },

                        "& .MuiButton-root": {
                            minWidth:
                                0,

                            minHeight: {
                                xs:
                                    44,

                                sm:
                                    40,
                            },

                            px: {
                                xs:
                                    1,

                                sm:
                                    2,
                            },

                            whiteSpace: {
                                xs:
                                    "normal",

                                sm:
                                    "nowrap",
                            },

                            lineHeight:
                                1.2,

                            textAlign:
                                "center",
                        },

                        "& .MuiButton-startIcon": {
                            mr: {
                                xs:
                                    0.5,

                                sm:
                                    1,
                            },
                        },
                    }}
                >
                    <Button
                        variant="outlined"
                        startIcon={
                            <CategoryOutlinedIcon />
                        }
                        onClick={() =>
                            dispatchModal(
                                "KategorienModal"
                            )
                        }
                        sx={{
                            gridColumn: {
                                xs:
                                    "1",

                                sm:
                                    "auto",
                            },

                            gridRow: {
                                xs:
                                    "2",

                                sm:
                                    "auto",
                            },
                        }}
                    >
                        Kategorien
                    </Button>


                    <Button
                        variant="contained"
                        startIcon={
                            <AddBoxOutlinedIcon />
                        }
                        onClick={() =>
                            dispatchModal(
                                "NewFrischBestandModal"
                            )
                        }
                        sx={{
                            gridColumn: {
                                xs:
                                    "1 / -1",

                                sm:
                                    "auto",
                            },

                            gridRow: {
                                xs:
                                    "1",

                                sm:
                                    "auto",
                            },
                        }}
                    >
                        Frischprodukt erstellen
                    </Button>


                    <Button
                        variant="outlined"
                        startIcon={
                            <StraightenOutlinedIcon />
                        }
                        onClick={() =>
                            dispatchModal(
                                "EinheitenModal"
                            )
                        }
                        sx={{
                            gridColumn: {
                                xs:
                                    "2",

                                sm:
                                    "auto",
                            },

                            gridRow: {
                                xs:
                                    "2",

                                sm:
                                    "auto",
                            },
                        }}
                    >
                        Einheiten
                    </Button>
                </Box>
            </Paper>


            {/* ============================================================= */}
            {/* Tabellenbereich                                               */}
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
                            Frischbestand wird geladen …
                        </Typography>
                    </Box>
                ) : (
                    <FrischBestandTable
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
            {/* Dialoge                                                       */}
            {/* ============================================================= */}

            <EditFrischBestandModal
                show={
                    modal.type ===
                    "EditFrischBestandModal"
                }
                close={() =>
                    dispatchModal(
                        null
                    )
                }
                persist={
                    persistFrischBestand
                }
                deleteFrischBestand={
                    deleteFrischBestand
                }
                einheiten={
                    einheiten
                }
                kategorien={
                    kategorien
                }
                produkt={
                    modal.entity
                }
            />


            <EditKategorieModal
                show={
                    modal.type ===
                    "KategorienModal"
                }
                close={() =>
                    dispatchModal(
                        null
                    )
                }
                create={
                    newKategorie
                }
                remove={
                    deleteKategorie
                }
                kategorien={
                    kategorien
                }
            />


            <NewFrischBestandModal
                show={
                    modal.type ===
                    "NewFrischBestandModal"
                }
                close={() =>
                    dispatchModal(
                        null
                    )
                }
                create={
                    newFrischBestand
                }
                columns={
                    columns
                }
                einheiten={
                    einheiten
                }
                kategorien={
                    kategorien
                }
            />


            <EditEinheitenModal
                show={
                    modal.type ===
                    "EinheitenModal"
                }
                close={() =>
                    dispatchModal(
                        null
                    )
                }
                create={
                    newEinheit
                }
                remove={
                    deleteEinheit
                }
                einheiten={
                    einheiten
                }
            />
        </Stack>
    );
}