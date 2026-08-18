import React from "react";

import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import StraightenOutlinedIcon from "@mui/icons-material/StraightenOutlined";

import { toast } from "react-toastify";

import {
    jsPDF,
} from "jspdf";

import {
    autoTable,
} from "jspdf-autotable";

import {
    LagerTable,
} from "./LagerTable.jsx";

import {
    EditProduktModal,
} from "./EditProduktModal.jsx";

import {
    EditKategorieModal,
} from "./EditKategorieModal.jsx";

import {
    NewProduktModal,
} from "./NewProduktModal.jsx";

import {
    EditEinheitenModal,
} from "./EditEinheitenModal.jsx";

import {
    useApi,
} from "../ApiService.jsx";

import {
    deepAssign,
    deepClone,
} from "../util";

import NumberFormatComponent
    from "../logic/NumberFormatComponent.jsx";


export function Lager() {
    // =========================================================================
    // Columns
    // =========================================================================

    const columns =
        React.useMemo(
            () => [
                {
                    header:
                        "Name",

                    accessorKey:
                        "name",
                },

                {
                    header:
                        "Ist Lagerbestand",

                    accessorKey:
                        "lagerbestand.istLagerbestand",

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
                        "Soll Lagerbestand",

                    accessorKey:
                        "lagerbestand.sollLagerbestand",

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
                        "Einheit",

                    accessorKey:
                        "lagerbestand.einheit.name",
                },

                {
                    header:
                        "Kategorie",

                    accessorKey:
                        "kategorie.name",
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
    // Response-Helfer
    // =========================================================================

    const extractArray = (
        result,
        embeddedName
    ) => {
        if (
            Array.isArray(
                result
            )
        ) {
            return result;
        }


        return (
            result
                ?._embedded
                ?.[embeddedName] ??
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
                            produktResponse,
                            einheitResponse,
                            kategorieResponse,
                        ] =
                            await Promise.all(
                                [
                                    api.readProdukt(),
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
                            !produktResponse.ok
                        ) {
                            throw new Error(
                                `Produkte: HTTP ${produktResponse.status}`
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
                            produktResult,
                            einheitResult,
                            kategorieResult,
                        ] =
                            await Promise.all(
                                [
                                    produktResponse.json(),
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
                                produktResult,
                                "produktRepresentationList"
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
                            "Fehler beim Laden des Lagers:",
                            error
                        );


                        if (
                            active
                        ) {
                            toast.error(
                                "Die Lagerdaten konnten nicht vollständig geladen werden."
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
    // Produkt aktualisieren
    // =========================================================================

    const persistProdukt =
        async (
            produkt,
            patch
        ) => {
            if (
                !produkt
            ) {
                return;
            }


            const changedData =
                deepClone(
                    produkt
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
                "lager";


            delete changedData
                ._links;


            try {
                const response =
                    await api.updateProdukt(
                        produkt.id,
                        changedData
                    );


                if (
                    response.ok
                ) {
                    toast.success(
                        `Das Produkt „${produkt.name}“ wurde erfolgreich aktualisiert.`
                    );


                    refresh();

                    return;
                }


                toast.error(
                    `Das Produkt „${produkt.name}“ konnte nicht aktualisiert werden. Bitte prüfe die Eingaben.`
                );
            } catch (
                error
            ) {
                console.error(
                    "Fehler beim Aktualisieren des Produktes:",
                    error
                );


                toast.error(
                    `Beim Aktualisieren von „${produkt.name}“ ist ein Fehler aufgetreten.`
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
                        "Die Kategorie konnte nicht gelöscht werden. Möglicherweise wird sie noch verwendet."
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
    // Produkt löschen
    // =========================================================================

    const deleteProdukt =
        async produkt => {
            if (
                !produkt
            ) {
                return;
            }


            try {
                const response =
                    await api.deleteProdukt(
                        produkt.id
                    );


                if (
                    !response.ok
                ) {
                    toast.error(
                        `Das Produkt „${produkt.name}“ konnte nicht gelöscht werden.`
                    );

                    return;
                }


                setData(
                    previous =>
                        previous.filter(
                            item =>
                                item.id !==
                                produkt.id
                        )
                );


                toast.success(
                    `Das Produkt „${produkt.name}“ wurde gelöscht.`
                );
            } catch (
                error
            ) {
                console.error(
                    "Fehler beim Löschen des Produktes:",
                    error
                );


                toast.error(
                    `Beim Löschen von „${produkt.name}“ ist ein Fehler aufgetreten.`
                );
            }
        };


    // =========================================================================
    // Produkt erstellen
    // =========================================================================

    const newProdukt =
        async productData => {
            const dataToCreate = {
                ...productData,

                type:
                    "lager",
            };


            try {
                const response =
                    await api.createProdukt(
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
                    "Fehler beim Erstellen des Produktes:",
                    error
                );


                toast.error(
                    `Das Produkt „${dataToCreate.name}“ konnte nicht erstellt werden.`
                );
            }
        };


    // =========================================================================
    // Einheiten
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
                        "Die Einheit konnte nicht gelöscht werden. Möglicherweise wird sie noch verwendet."
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
    // PDF
    // =========================================================================

    const createPDF = () => {
        const doc =
            new jsPDF();


        const currentDate =
            new Date();


        const formattedDate =
            currentDate.toLocaleDateString(
                "de-DE"
            );


        const fileDate = [
            currentDate.getDate(),
            currentDate.getMonth() +
                1,
            currentDate.getFullYear(),
        ].join(
            "-"
        );


        doc.text(
            `Einkaufsliste Lager ${formattedDate}`,
            14,
            10
        );


        const pdfData =
            data
                .filter(
                    item =>
                        !Object.prototype.hasOwnProperty.call(
                            item,
                            "produkte"
                        )
                )
                .map(
                    product => {
                        const soll =
                            Number(
                                product
                                    ?.lagerbestand
                                    ?.sollLagerbestand ??
                                0
                            );


                        const ist =
                            Number(
                                product
                                    ?.lagerbestand
                                    ?.istLagerbestand ??
                                0
                            );


                        return {
                            productName:
                                product.name,

                            differenz:
                                soll -
                                ist,
                        };
                    }
                )
                .filter(
                    ({
                        differenz,
                    }) =>
                        differenz >
                        0
                )
                .map(
                    ({
                        productName,
                        differenz,
                    }) => [
                        productName,
                        differenz,
                    ]
                );


        autoTable(
            doc,
            {
                head: [
                    [
                        "Produktname",
                        "Fehlende Menge",
                    ],
                ],

                body:
                    pdfData,

                startY:
                    18,
            }
        );


        doc.save(
            `Einkaufsliste-Lager-${fileDate}.pdf`
        );
    };


    // =========================================================================
    // Render
    // =========================================================================

    return (
        <Stack
            spacing={2}
            sx={{
                width:
                    "100%",

                /*
                 * Dieser Screen selbst wird auf Desktop
                 * NICHT gescrollt.
                 */
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
                    Lagerbestand
                </Typography>


                <Typography
                    variant="body1"
                    color="text.secondary"
                >
                    Produkte, Kategorien und
                    Einheiten verwalten sowie
                    eine Einkaufsliste aus dem
                    aktuellen Lagerbestand
                    erzeugen.
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
                                "NewProduktModal"
                            )
                        }
                    >
                        Produkt erstellen
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


                    <Button
                        variant="outlined"
                        startIcon={
                            <DownloadOutlinedIcon />
                        }
                        onClick={
                            createPDF
                        }
                    >
                        Einkaufsliste
                    </Button>
                </Stack>
            </Paper>


            {/* ============================================================= */}
            {/* Tabellenbereich                                               */}
            {/* ============================================================= */}

            <Box
                sx={{
                    /*
                     * Nimmt EXAKT den verbleibenden Platz.
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
                            Lager wird geladen …
                        </Typography>
                    </Box>
                ) : (
                    <LagerTable
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

            <EditProduktModal
                show={
                    modal.type ===
                    "EditProduktModal"
                }
                close={() =>
                    dispatchModal(
                        null
                    )
                }
                persist={
                    persistProdukt
                }
                deleteProdukt={
                    deleteProdukt
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


            <NewProduktModal
                show={
                    modal.type ===
                    "NewProduktModal"
                }
                close={() =>
                    dispatchModal(
                        null
                    )
                }
                create={
                    newProdukt
                }
                columns={
                    columns
                }
                kategorien={
                    kategorien
                }
                einheiten={
                    einheiten
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


            <EditKategorieModal
                show={
                    modal.type ===
                        "KategorienModal" ||
                    modal.type ===
                        "EditKategorieModal"
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
        </Stack>
    );
}