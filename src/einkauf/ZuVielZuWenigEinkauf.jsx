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
    Alert,
    Box,
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    TextField,
} from "@mui/material";

import { useApi } from "../ApiService.jsx";
import NumberFormatComponent from "../logic/NumberFormatComponent.jsx";


const getItemKey = (item, index) =>
    item?.id ?? `discrepancy-${index}`;


export function ZuVielZuWenigEinkauf(props) {
    const api = useApi();

    const [
        discrepancy,
        setDiscrepancy,
    ] = useState([]);

    const [
        amounts,
        setAmounts,
    ] = useState({});

    const [
        sorting,
        setSorting,
    ] = useState([]);


    // =========================================================================
    // Daten laden
    // =========================================================================

    useEffect(() => {
        let active = true;

        const fetchBestellUebersicht =
            async () => {
                try {
                    const response =
                        await api.readBestellUebersicht();

                    if (!response.ok) {
                        return;
                    }

                    const text =
                        await response.text();

                    if (!text || !active) {
                        return;
                    }

                    const json =
                        JSON.parse(text);

                    const data =
                        Array.isArray(
                            json.discrepancy
                        )
                            ? json.discrepancy
                            : [];

                    setDiscrepancy(data);
                } catch (error) {
                    console.error(
                        "Error fetching discrepancy:",
                        error
                    );
                }
            };

        fetchBestellUebersicht();

        return () => {
            active = false;
        };
    }, [
        api,
        props.forceUpdate,
    ]);


    // =========================================================================
    // Nach erfolgreichem Einkauf Eingaben zurücksetzen
    // =========================================================================

    useEffect(() => {
        setAmounts({});
    }, [props.resetKey]);


    // =========================================================================
    // Daten an Parent melden
    // =========================================================================

    useEffect(() => {
        props.handleDiscrepancy?.(
            discrepancy
        );
    }, [
        discrepancy,
        props.handleDiscrepancy,
    ]);


    useEffect(() => {
        props.onAmountsChange?.(
            amounts
        );
    }, [
        amounts,
        props.onAmountsChange,
    ]);


    // =========================================================================
    // Preis
    // =========================================================================

    const totalPrice =
        useMemo(() => {
            return discrepancy.reduce(
                (
                    total,
                    item,
                    index
                ) => {
                    const key =
                        getItemKey(
                            item,
                            index
                        );

                    const amount =
                        Number(
                            amounts[key] ??
                                0
                        );

                    const price =
                        Number(
                            item?.bestand
                                ?.preis ?? 0
                        );

                    return (
                        total +
                        amount * price
                    );
                },
                0
            );
        }, [
            discrepancy,
            amounts,
        ]);


    useEffect(() => {
        props.onPriceChange?.(
            totalPrice
        );
    }, [
        totalPrice,
        props.onPriceChange,
    ]);


    // =========================================================================
    // Summe mischbarer Kategorie
    // =========================================================================

    const calculateCategorySum =
        categoryName => {
            return discrepancy.reduce(
                (
                    total,
                    item
                ) => {
                    const category =
                        item?.bestand
                            ?.kategorie;

                    if (
                        category?.name !==
                            categoryName ||
                        !category?.mixable
                    ) {
                        return total;
                    }

                    return (
                        total +
                        Number(
                            item.zuVielzuWenig ??
                                0
                        )
                    );
                },
                0
            );
        };


    // =========================================================================
    // Columns
    // =========================================================================

    const columns = useMemo(
        () => [
            {
                header: "Produkt",
                accessorKey:
                    "bestand.name",
            },
            {
                header: "Preis in €",
                accessorKey:
                    "bestand.preis",

                cell: info => (
                    <NumberFormatComponent
                        value={
                            info.getValue()
                        }
                    />
                ),
            },
            {
                header:
                    "Bestellmenge gesamt",
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
                    "Zu viel / zu wenig",
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
            {
                id:
                    "insgesamtzuVielzuWenig",

                header:
                    "Kategorie gesamt",

                accessorFn: row =>
                    row?.bestand
                        ?.kategorie
                        ?.mixable
                        ? calculateCategorySum(
                            row.bestand
                                .kategorie
                                .name
                        )
                        : null,

                cell: info => {
                    const category =
                        info.row.original
                            ?.bestand
                            ?.kategorie;

                    if (
                        !category?.mixable
                    ) {
                        return "–";
                    }

                    return (
                        <NumberFormatComponent
                            value={
                                info.getValue()
                            }
                            includeFractionDigits={
                                false
                            }
                        />
                    );
                },
            },
            {
                id: "menge",
                header:
                    "Genommene Menge",
                enableSorting: false,

                cell: info => {
                    const item =
                        info.row.original;

                    const sourceIndex =
                        discrepancy.indexOf(
                            item
                        );

                    const key =
                        getItemKey(
                            item,
                            sourceIndex
                        );

                    const unavailable =
                        item?.bestand
                            ?.verfuegbarkeit ===
                        false;

                    return (
                        <TextField
                            size="small"
                            type="number"
                            value={
                                amounts[key] ??
                                ""
                            }
                            disabled={
                                unavailable
                            }
                            slotProps={{
                                htmlInput: {
                                    min: 0,
                                    step: 1,
                                },
                            }}
                            onChange={event => {
                                const value =
                                    event.target
                                        .value;

                                setAmounts(
                                    previous => ({
                                        ...previous,

                                        [key]:
                                            value,
                                    })
                                );
                            }}
                            sx={{
                                width: 110,
                            }}
                        />
                    );
                },
            },
            {
                header: "Einheit",
                accessorKey:
                    "bestand.einheit.name",
            },
            {
                header: "Kategorie",
                accessorKey:
                    "bestand.kategorie.name",
            },
        ],
        [
            discrepancy,
            amounts,
        ]
    );


    const table =
        useReactTable({
            data: discrepancy,
            columns,

            state: {
                sorting,
            },

            onSortingChange:
                setSorting,

            getCoreRowModel:
                getCoreRowModel(),

            getSortedRowModel:
                getSortedRowModel(),
        });


    const hasRelevantItems =
        discrepancy.some(
            item =>
                Number(
                    item.zuVielzuWenig
                ) > 0
        );


    if (
        discrepancy.length === 0 ||
        !hasRelevantItems
    ) {
        return null;
    }


    return (
        <Box>
            <Alert
                severity="info"
                sx={{
                    mb: 2,
                }}
            >
                Die Spalte
                „Kategorie gesamt“ zeigt
                bei mischbaren Kategorien
                an, wie viel insgesamt zu
                viel oder zu wenig
                geliefert wurde. Beispiel:
                Wurden 14 kg Äpfel
                bestellt und insgesamt
                12 kg geliefert, beträgt
                die Abweichung −2 kg.
            </Alert>

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
                        minWidth: 1050,
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
                                                            fontWeight: 700,
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
                            .rows.map(row => {
                                const unavailable =
                                    row
                                        .original
                                        ?.bestand
                                        ?.verfuegbarkeit ===
                                    false;

                                return (
                                    <TableRow
                                        key={
                                            row.id
                                        }
                                        hover
                                        sx={{
                                            opacity:
                                                unavailable
                                                    ? 0.5
                                                    : 1,
                                        }}
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
                                                        {cell.column
                                                            .id ===
                                                            "zuVielzuWenig" &&
                                                        Number(
                                                            cell.getValue()
                                                        ) !==
                                                            0 ? (
                                                            <Chip
                                                                size="small"
                                                                color={
                                                                    Number(
                                                                        cell.getValue()
                                                                    ) >
                                                                    0
                                                                        ? "warning"
                                                                        : "info"
                                                                }
                                                                label={
                                                                    <NumberFormatComponent
                                                                        value={
                                                                            cell.getValue()
                                                                        }
                                                                        includeFractionDigits={
                                                                            false
                                                                        }
                                                                    />
                                                                }
                                                            />
                                                        ) : (
                                                            flexRender(
                                                                cell
                                                                    .column
                                                                    .columnDef
                                                                    .cell,
                                                                cell.getContext()
                                                            )
                                                        )}
                                                    </TableCell>
                                                )
                                            )}
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}