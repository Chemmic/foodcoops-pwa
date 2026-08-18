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
    //
    // Neues Backend:
    //
    // [
    //     {...},
    //     {...}
    // ]
    //
    // Altes HAL Backend:
    //
    // {
    //     "_embedded": {
    //         "frischBestandRepresentationList": [...]
    //     }
    // }
    //
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


            /*
             * HAL Links nie zurück ans Backend schicken.
             */
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
            spacing={2}
            sx={{
                /*
                 * Identisch zu Lager und Brot.
                 */
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
                >
                    Frischbestand
                </Typography>


                <Typography
                    variant="body1"
                    color="text.secondary"
                >
                    Frischprodukte,
                    Verfügbarkeit,
                    Gebindegrößen,
                    Kategorien und
                    Einheiten verwalten.
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
                            1.5,

                        sm:
                            2,
                    },

                    border:
                        1,

                    borderColor:
                        "divider",
                }}
            >
                <Stack
                    direction={{
                        xs:
                            "column",

                        sm:
                            "row",
                    }}
                    spacing={
                        1
                    }
                    sx={{
                        flexWrap:
                            "wrap",
                    }}
                    useFlexGap
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
                    >
                        Einheiten
                    </Button>
                </Stack>
            </Paper>


            {/* ============================================================= */}
            {/* Tabellenbereich                                               */}
            {/* ============================================================= */}

            <Box
                sx={{
                    /*
                     * Nimmt ausschließlich den nach Kopf und
                     * Buttonleiste verbleibenden Platz ein.
                     */
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