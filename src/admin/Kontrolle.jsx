import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Alert,
    Button,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";

import AddOutlinedIcon from "@mui/icons-material/Add";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import { toast } from "react-toastify";

import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

import { useApi } from "../ApiService.jsx";

import NumberFormatComponent from "../logic/NumberFormatComponent.jsx";

import { AddNewFrischModal } from "./AddNewFrischModal.jsx";


export function Kontrolle() {
    const api = useApi();

    const [
        discrepancy,
        setDiscrepancy,
    ] = useState([]);

    const [
        frischBestandForModal,
        setFrischBestandForModal,
    ] = useState([]);

    const [
        discrepancyForModal,
        setDiscrepancyForModal,
    ] = useState([]);

    const [
        values,
        setValues,
    ] = useState({});

    const [
        showModal,
        setShowModal,
    ] = useState(false);

    const [
        refreshCounter,
        refresh,
    ] = React.useReducer(
        value => value + 1,
        0
    );


    // =========================================================================
    // Daten
    // =========================================================================

    useEffect(() => {
        let active = true;


        const loadData =
            async () => {
                try {
                    const [
                        overviewResponse,
                        stockResponse,
                    ] =
                        await Promise.all([
                            api.readBestellUebersicht(),
                            api.readFrischBestand(),
                        ]);


                    if (!active) {
                        return;
                    }


                    if (
                        overviewResponse.ok
                    ) {
                        const json =
                            await overviewResponse.json();


                        const source =
                            Array.isArray(
                                json?.discrepancy
                            )
                                ? json.discrepancy
                                : [];


                        const mixable =
                            source
                                .filter(
                                    item =>
                                        item
                                            ?.bestand
                                            ?.kategorie
                                            ?.mixable
                                )
                                .sort(
                                    (
                                        a,
                                        b
                                    ) => {
                                        const category =
                                            (
                                                a
                                                    ?.bestand
                                                    ?.kategorie
                                                    ?.name ??
                                                ""
                                            ).localeCompare(
                                                b
                                                    ?.bestand
                                                    ?.kategorie
                                                    ?.name ??
                                                    ""
                                            );

                                        if (
                                            category !==
                                            0
                                        ) {
                                            return category;
                                        }

                                        return (
                                            a
                                                ?.bestand
                                                ?.name ??
                                            ""
                                        ).localeCompare(
                                            b
                                                ?.bestand
                                                ?.name ??
                                                ""
                                        );
                                    }
                                );


                        const nonMixable =
                            source
                                .filter(
                                    item =>
                                        !item
                                            ?.bestand
                                            ?.kategorie
                                            ?.mixable
                                )
                                .sort(
                                    (
                                        a,
                                        b
                                    ) =>
                                        (
                                            a
                                                ?.bestand
                                                ?.name ??
                                            ""
                                        ).localeCompare(
                                            b
                                                ?.bestand
                                                ?.name ??
                                                ""
                                        )
                                );


                        const all = [
                            ...mixable,
                            ...nonMixable,
                        ];


                        setDiscrepancyForModal(
                            all
                        );

                        setDiscrepancy(
                            all.filter(
                                item =>
                                    Number(
                                        item.zuVielzuWenig
                                    ) !== 0
                            )
                        );
                    }


                    if (
                        stockResponse.ok
                    ) {
                        const json =
                            await stockResponse.json();

                        const stock =
                            Array.isArray(
                                json
                            )
                                ? json
                                : json
                                    ?._embedded
                                    ?.frischBestandRepresentationList ??
                                [];


                        setFrischBestandForModal(
                            stock
                        );
                    }
                } catch (error) {
                    console.error(
                        "Kontrolldaten konnten nicht geladen werden:",
                        error
                    );

                    toast.error(
                        "Die Zu-viel-/Zu-wenig-Liste konnte nicht geladen werden."
                    );
                }
            };


        loadData();


        return () => {
            active = false;
        };
    }, [
        api,
        refreshCounter,
    ]);


    // =========================================================================
    // Gruppen für Anzeige
    // =========================================================================

    const groupedRows =
        useMemo(() => {
            const result = [];

            let currentCategory =
                null;

            let currentUnit =
                null;

            let total = 0;


            const pushTotal =
                () => {
                    if (
                        currentCategory ===
                        null
                    ) {
                        return;
                    }

                    result.push({
                        type:
                            "total",

                        key:
                            `total-${currentCategory}`,

                        category:
                            currentCategory,

                        unit:
                            currentUnit,

                        total,
                    });
                };


            discrepancy.forEach(
                item => {
                    const category =
                        item?.bestand
                            ?.kategorie;

                    if (
                        category?.mixable
                    ) {
                        if (
                            currentCategory !==
                                null &&
                            currentCategory !==
                                category.name
                        ) {
                            pushTotal();

                            total = 0;
                        }


                        currentCategory =
                            category.name;

                        currentUnit =
                            item?.bestand
                                ?.einheit
                                ?.name ??
                            "";

                        total +=
                            Number(
                                item.zuVielzuWenig ??
                                    0
                            );


                        result.push({
                            type:
                                "item",

                            item,
                        });

                        return;
                    }


                    if (
                        currentCategory !==
                        null
                    ) {
                        pushTotal();

                        currentCategory =
                            null;

                        currentUnit =
                            null;

                        total = 0;
                    }


                    result.push({
                        type:
                            "item",

                        item,
                    });
                }
            );


            if (
                currentCategory !==
                null
            ) {
                pushTotal();
            }


            return result;
        }, [discrepancy]);


    // =========================================================================
    // Änderungen speichern
    // =========================================================================

    const submitUpdateDiscr =
        async () => {
            const changes =
                discrepancy.filter(
                    item =>
                        values[item.id] !==
                            undefined &&
                        values[item.id] !==
                            ""
                );


            if (
                changes.length === 0
            ) {
                toast.info(
                    "Es wurden keine Änderungen eingetragen."
                );

                return;
            }


            try {
                const responses =
                    await Promise.all(
                        changes.map(
                            item =>
                                api.updateDiscrepancy(
                                    item.id,
                                    values[
                                        item.id
                                    ]
                                )
                        )
                    );


                if (
                    responses.some(
                        response =>
                            !response.ok
                    )
                ) {
                    toast.error(
                        "Mindestens eine Änderung konnte nicht gespeichert werden."
                    );

                    return;
                }


                toast.success(
                    "Die Änderungen wurden erfolgreich gespeichert."
                );


                setValues({});

                refresh();


                window.scrollTo({
                    top: 0,
                    behavior:
                        "smooth",
                });
            } catch (error) {
                console.error(
                    "Fehler beim Speichern der Abweichungen:",
                    error
                );

                toast.error(
                    "Die Änderungen konnten nicht gespeichert werden."
                );
            }
        };


    // =========================================================================
    // PDF
    // =========================================================================

    const generatePDF = () => {
        const currentDate =
            new Date();

        const formattedDate =
            new Intl.DateTimeFormat(
                "de-DE"
            ).format(
                currentDate
            );


        const doc =
            new jsPDF();


        doc.text(
            `Zu viel / Zu wenig – ${formattedDate}`,
            14,
            14
        );


        const body =
            groupedRows.map(
                row => {
                    if (
                        row.type ===
                        "total"
                    ) {
                        return [
                            `Gesamt Kategorie ${row.category}`,
                            row.total,
                            row.unit,
                        ];
                    }


                    return [
                        row.item
                            ?.bestand
                            ?.name ??
                            "",

                        row.item
                            ?.zuVielzuWenig ??
                            0,

                        row.item
                            ?.bestand
                            ?.einheit
                            ?.name ??
                            "",
                    ];
                }
            );


        autoTable(doc, {
            startY: 20,

            head: [
                [
                    "Produkt",
                    "Zu viel / zu wenig",
                    "Einheit",
                ],
            ],

            body,
        });


        doc.save(
            `zuViel-zuWenig_${formattedDate.replaceAll(
                ".",
                "-"
            )}.pdf`
        );
    };


    return (
        <Stack spacing={2}>
            <Alert severity="info">
                Wenn weniger geliefert
                wurde als bestellt, trage
                eine negative Abweichung
                ein. Beispiel: 10 Einheiten
                bestellt und 8 geliefert
                ergibt <strong>-2</strong>.
            </Alert>


            <Button
                variant="outlined"
                startIcon={
                    <AddOutlinedIcon />
                }
                onClick={() =>
                    setShowModal(true)
                }
                sx={{
                    alignSelf:
                        "flex-start",
                }}
            >
                Produkt hinzufügen
            </Button>


            <AddNewFrischModal
                show={showModal}
                close={() =>
                    setShowModal(false)
                }
                updateParent={
                    refresh
                }
                frischBestandForModal={
                    frischBestandForModal
                }
                discrepancyForModal={
                    discrepancyForModal
                }
            />


            {discrepancy.length ===
            0 ? (
                <Alert severity="success">
                    Es gibt momentan
                    nichts auf der
                    Zu-viel-/Zu-wenig-Liste.
                </Alert>
            ) : (
                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        border: 1,
                        borderColor:
                            "divider",

                        borderRadius: 2,

                        overflowX:
                            "auto",
                    }}
                >
                    <Table
                        stickyHeader
                        size="small"
                        sx={{
                            minWidth:
                                650,
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        fontWeight:
                                            700,
                                    }}
                                >
                                    Produkt
                                </TableCell>

                                <TableCell
                                    sx={{
                                        fontWeight:
                                            700,
                                    }}
                                >
                                    Zu viel /
                                    zu wenig
                                </TableCell>

                                <TableCell
                                    sx={{
                                        fontWeight:
                                            700,
                                    }}
                                >
                                    Einheit
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {groupedRows.map(
                                row => {
                                    if (
                                        row.type ===
                                        "total"
                                    ) {
                                        return (
                                            <TableRow
                                                key={
                                                    row.key
                                                }
                                                sx={{
                                                    bgcolor:
                                                        "action.hover",

                                                    "& td":
                                                        {
                                                            borderBottomWidth:
                                                                2,
                                                        },
                                                }}
                                            >
                                                <TableCell>
                                                    <Typography
                                                        fontWeight={
                                                            700
                                                        }
                                                    >
                                                        Gesamt
                                                        Kategorie{" "}
                                                        <em>
                                                            {
                                                                row.category
                                                            }
                                                        </em>
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography
                                                        fontWeight={
                                                            700
                                                        }
                                                    >
                                                        <NumberFormatComponent
                                                            value={
                                                                row.total
                                                            }
                                                        />
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    {
                                                        row.unit
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }


                                    const item =
                                        row.item;


                                    return (
                                        <TableRow
                                            key={
                                                item.id
                                            }
                                            hover
                                        >
                                            <TableCell>
                                                {
                                                    item
                                                        ?.bestand
                                                        ?.name
                                                }
                                            </TableCell>

                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    value={
                                                        values[
                                                            item.id
                                                        ] ??
                                                        ""
                                                    }
                                                    placeholder={
                                                        String(
                                                            item.zuVielzuWenig ??
                                                                ""
                                                        )
                                                    }
                                                    onChange={
                                                        event =>
                                                            setValues(
                                                                previous => ({
                                                                    ...previous,

                                                                    [item.id]:
                                                                        event
                                                                            .target
                                                                            .value,
                                                                })
                                                            )
                                                    }
                                                    sx={{
                                                        width:
                                                            130,
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    item
                                                        ?.bestand
                                                        ?.einheit
                                                        ?.name
                                                }
                                            </TableCell>
                                        </TableRow>
                                    );
                                }
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}


            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                spacing={1}
            >
                <Button
                    variant="contained"
                    startIcon={
                        <SaveOutlinedIcon />
                    }
                    onClick={
                        submitUpdateDiscr
                    }
                >
                    Aktualisieren
                </Button>

                <Button
                    variant="outlined"
                    startIcon={
                        <DownloadOutlinedIcon />
                    }
                    onClick={
                        generatePDF
                    }
                >
                    PDF erstellen
                </Button>
            </Stack>
        </Stack>
    );
}