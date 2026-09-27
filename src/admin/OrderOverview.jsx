import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
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
    TableSortLabel,
    Typography,
} from "@mui/material";

import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { toast } from "react-toastify";

import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

import { useApi } from "../ApiService.jsx";
import NumberFormatComponent from "../logic/NumberFormatComponent.jsx";


function downloadBase64Pdf(json) {
    const binaryString =
        window.atob(json.pdf);

    const bytes =
        new Uint8Array(
            binaryString.length
        );


    for (
        let index = 0;
        index <
        binaryString.length;
        index++
    ) {
        bytes[index] =
            binaryString.charCodeAt(
                index
            );
    }


    const blob =
        new Blob(
            [bytes],
            {
                type:
                    "application/pdf",
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );

    link.href = url;

    link.download =
        `${json.filename}.pdf`;

    document.body.appendChild(
        link
    );

    link.click();
    link.remove();

    URL.revokeObjectURL(
        url
    );
}


function OverviewTable({
    table,
    minWidth = 700,
}) {
    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{
                border: 1,
                borderColor:
                    "divider",
                borderRadius: 2,
                overflowX: "auto",
            }}
        >
            <Table
                stickyHeader
                size="small"
                sx={{
                    minWidth,
                }}
            >
                <TableHead>
                    {table
                        .getHeaderGroups()
                        .map(
                            headerGroup => (
                                <TableRow
                                    key={
                                        headerGroup.id
                                    }
                                >
                                    {headerGroup.headers.map(
                                        header => {
                                            const sorted =
                                                header.column.getIsSorted();

                                            return (
                                                <TableCell
                                                    key={
                                                        header.id
                                                    }
                                                    sx={{
                                                        fontWeight:
                                                            700,
                                                    }}
                                                >
                                                    {header.column.getCanSort() ? (
                                                        <TableSortLabel
                                                            active={
                                                                Boolean(
                                                                    sorted
                                                                )
                                                            }
                                                            direction={
                                                                sorted ===
                                                                "desc"
                                                                    ? "desc"
                                                                    : "asc"
                                                            }
                                                            onClick={
                                                                header.column.getToggleSortingHandler()
                                                            }
                                                        >
                                                            {flexRender(
                                                                header
                                                                    .column
                                                                    .columnDef
                                                                    .header,
                                                                header.getContext()
                                                            )}
                                                        </TableSortLabel>
                                                    ) : (
                                                        flexRender(
                                                            header
                                                                .column
                                                                .columnDef
                                                                .header,
                                                            header.getContext()
                                                        )
                                                    )}
                                                </TableCell>
                                            );
                                        }
                                    )}
                                </TableRow>
                            )
                        )}
                </TableHead>

                <TableBody>
                    {table
                        .getRowModel()
                        .rows.map(row => (
                            <TableRow
                                key={row.id}
                                hover
                            >
                                {row
                                    .getVisibleCells()
                                    .map(
                                        cell => (
                                            <TableCell
                                                key={
                                                    cell.id
                                                }
                                            >
                                                {flexRender(
                                                    cell
                                                        .column
                                                        .columnDef
                                                        .cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        )
                                    )}
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}


export function OrderOverview() {
    const api = useApi();

    const [
        discrepancy,
        setDiscrepancy,
    ] = useState([]);

    const [
        brotBestellungOverview,
        setBrotBestellungOverview,
    ] = useState([]);

    const [
        frischSorting,
        setFrischSorting,
    ] = useState([]);

    const [
        brotSorting,
        setBrotSorting,
    ] = useState([]);

    // =========================================================================
    // Daten laden
    // =========================================================================

    useEffect(() => {
        let active = true;


        const loadData =
            async () => {
                try {
                    const response =
                        await api.readBestellUebersicht();


                    if (!response.ok) {
                        throw new Error(
                            `HTTP ${response.status}`
                        );
                    }


                    const data =
                        await response.json();


                    if (!active) {
                        return;
                    }


                    setDiscrepancy(
                        Array.isArray(
                            data?.discrepancy
                        )
                            ? data.discrepancy
                            : []
                    );


                    setBrotBestellungOverview(
                        Array.isArray(
                            data?.brotBestellung
                        )
                            ? data.brotBestellung
                            : []
                    );
                } catch (error) {
                    console.error(
                        "Bestellübersicht konnte nicht geladen werden:",
                        error
                    );

                    toast.error(
                        "Die Bestellübersicht konnte nicht geladen werden."
                    );
                }
            };


        loadData();


        return () => {
            active = false;
        };
    }, [
        api,
    ]);


    // =========================================================================
    // Columns
    // =========================================================================

    const frischColumns =
        useMemo(
            () => [
                {
                    header:
                        "Produkt",

                    accessorKey:
                        "bestand.name",
                },

                {
                    header:
                        "Bestellmenge",

                    accessorKey:
                        "gewollteMenge",

                    cell: info => (
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
                        "bestand.einheit.name",
                },

                {
                    header:
                        "Gebindegröße",

                    accessorKey:
                        "bestand.gebindegroesse",

                    cell: info => (
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
                    id:
                        "zuBestellendeGebinde",

                    header:
                        "Zu bestellende Gebinde",

                    accessorKey:
                        "zuBestellendeGebinde",

                    enableSorting:
                        false,

                    // Festgelegt wird unter "Organisation" (Organisator)
                    cell: info => (
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
                        "Zu viel / Zu wenig",

                    accessorKey:
                        "zuVielzuWenig",

                    cell: info => (
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
            ],
            []
        );


    const brotColumns =
        useMemo(
            () => [
                {
                    header:
                        "Produkt",

                    accessorKey:
                        "brotBestand.name",
                },

                {
                    header:
                        "Zu bestellende Menge",

                    accessorKey:
                        "bestellmenge",

                    cell: info => (
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
            ],
            []
        );


    const frischTable =
        useReactTable({
            data: discrepancy,
            columns:
                frischColumns,

            state: {
                sorting:
                    frischSorting,
            },

            onSortingChange:
                setFrischSorting,

            getCoreRowModel:
                getCoreRowModel(),

            getSortedRowModel:
                getSortedRowModel(),
        });


    const brotTable =
        useReactTable({
            data:
                brotBestellungOverview,

            columns:
                brotColumns,

            state: {
                sorting:
                    brotSorting,
            },

            onSortingChange:
                setBrotSorting,

            getCoreRowModel:
                getCoreRowModel(),

            getSortedRowModel:
                getSortedRowModel(),
        });


    // =========================================================================
    // Server-PDF
    // =========================================================================

    const generateServerPdf =
        async request => {
            try {
                const response =
                    await request();


                if (!response.ok) {
                    throw new Error(
                        `HTTP ${response.status}`
                    );
                }


                const json =
                    await response.json();

                downloadBase64Pdf(
                    json
                );
            } catch (error) {
                console.error(
                    "PDF konnte nicht heruntergeladen werden:",
                    error
                );

                toast.error(
                    "Das PDF konnte nicht heruntergeladen werden."
                );
            }
        };


    // =========================================================================
    // Kombiniertes PDF
    // =========================================================================

    const generateCombinedPDF =
        () => {
            const doc =
                new jsPDF();


            doc.text(
                "Bestellübersicht – Brotbestellungen",
                14,
                14
            );


            const breadRows =
                brotBestellungOverview
                    .filter(
                        item =>
                            Number(
                                item.bestellmenge
                            ) !== 0
                    )
                    .map(
                        item => [
                            item
                                ?.brotBestand
                                ?.name ??
                                "",

                            item.bestellmenge ??
                                0,
                        ]
                    );


            autoTable(doc, {
                startY: 20,

                head: [
                    [
                        "Produkt",
                        "Zu bestellende Menge",
                    ],
                ],

                body:
                    breadRows,
            });


            doc.addPage();


            doc.text(
                "Bestellübersicht – Frischbestellungen",
                14,
                14
            );


            const freshRows =
                discrepancy
                    .filter(
                        item =>
                            Number(
                                item.gewollteMenge
                            ) !== 0
                    )
                    .map(
                        item => [
                            item
                                ?.bestand
                                ?.name ??
                                "",

                            item.gewollteMenge ??
                                0,

                            item
                                ?.bestand
                                ?.einheit
                                ?.name ??
                                "",

                            item
                                ?.bestand
                                ?.gebindegroesse ??
                                0,

                            item.zuBestellendeGebinde ??
                                0,
                        ]
                    );


            autoTable(doc, {
                startY: 20,

                head: [
                    [
                        "Produkt",
                        "Bestellmenge",
                        "Einheit",
                        "Gebindegröße",
                        "Zu bestellende Gebinde",
                    ],
                ],

                body:
                    freshRows,
            });


            doc.save(
                "Kombinierte_Bestelluebersicht.pdf"
            );
        };


    return (
        <Stack spacing={2}>
            <Accordion
                defaultExpanded
                disableGutters
            >
                <AccordionSummary
                    expandIcon={
                        <ExpandMoreIcon />
                    }
                >
                    <Typography
                        variant="h6"
                    >
                        Frisch
                    </Typography>
                </AccordionSummary>

                <AccordionDetails>
                    <Stack spacing={2}>
                        {discrepancy.length ===
                        0 ? (
                            <Alert severity="info">
                                Es gibt aktuell
                                keine
                                Frischbestellungen.
                            </Alert>
                        ) : (
                            <OverviewTable
                                table={
                                    frischTable
                                }
                                minWidth={
                                    900
                                }
                            />
                        )}

                        <Alert severity="info">
                            Was final bestellt wird, legt die Rolle Organisator unter
                            „Organisation" fest.
                        </Alert>

                        <Stack
                            direction={{
                                xs:
                                    "column",
                                sm: "row",
                            }}
                            spacing={1}
                        >
                            <Button
                                variant="outlined"
                                startIcon={
                                    <DownloadOutlinedIcon />
                                }
                                onClick={() =>
                                    generateServerPdf(
                                        api.getUebersichtFrischByte
                                    )
                                }
                            >
                                Frischbestellungen als PDF
                            </Button>
                        </Stack>
                    </Stack>
                </AccordionDetails>
            </Accordion>


            <Accordion disableGutters>
                <AccordionSummary
                    expandIcon={
                        <ExpandMoreIcon />
                    }
                >
                    <Typography
                        variant="h6"
                    >
                        Brot
                    </Typography>
                </AccordionSummary>

                <AccordionDetails>
                    <Stack spacing={2}>
                        {brotBestellungOverview.length ===
                        0 ? (
                            <Alert severity="info">
                                Es gibt aktuell
                                keine
                                Brotbestellungen.
                            </Alert>
                        ) : (
                            <OverviewTable
                                table={
                                    brotTable
                                }
                            />
                        )}

                        <Button
                            variant="outlined"
                            startIcon={
                                <DownloadOutlinedIcon />
                            }
                            onClick={() =>
                                generateServerPdf(
                                    api.getUebersichtBrotByte
                                )
                            }
                            sx={{
                                alignSelf:
                                    "flex-start",
                            }}
                        >
                            Brotbestellungen als PDF
                        </Button>
                    </Stack>
                </AccordionDetails>
            </Accordion>


            <Button
                variant="outlined"
                startIcon={
                    <DownloadOutlinedIcon />
                }
                onClick={
                    generateCombinedPDF
                }
                sx={{
                    alignSelf:
                        "flex-start",
                }}
            >
                Gesamte Bestellübersicht als PDF
            </Button>
        </Stack>
    );
}