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
    Box,
    Chip,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    TextField,
    Typography,
} from "@mui/material";

import { useApi } from "../ApiService.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

import NumberFormatComponent from "../logic/NumberFormatComponent.jsx";


const getItemKey = (item, index) =>
    item?.id ?? `frisch-${index}`;


export function FrischEinkauf(props) {
    const api = useApi();

    const { keycloak } =
        useAuth();

    const [
        frischBestellung,
        setFrischBestellung,
    ] = useState([]);

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

        const loadData =
            async () => {
                const personId =
                    keycloak
                        ?.tokenParsed
                        ?.preferred_username;

                if (!personId) {
                    return;
                }

                try {
                    const [
                        orderResponse,
                        overviewResponse,
                    ] =
                        await Promise.all([
                            api.readFrischBestellungBetweenDatesProPerson(
                                personId
                            ),

                            api.readBestellUebersicht(),
                        ]);


                    if (!active) {
                        return;
                    }


                    if (
                        orderResponse.ok
                    ) {
                        const data =
                            await orderResponse.json();

                        const orders =
                            data?._embedded
                                ?.frischBestellungRepresentationList;

                        setFrischBestellung(
                            Array.isArray(
                                orders
                            )
                                ? orders
                                : []
                        );
                    }


                    if (
                        overviewResponse.ok
                    ) {
                        const text =
                            await overviewResponse.text();

                        if (text) {
                            const json =
                                JSON.parse(
                                    text
                                );

                            setDiscrepancy(
                                Array.isArray(
                                    json.discrepancy
                                )
                                    ? json.discrepancy
                                    : []
                            );
                        }
                    }
                } catch (error) {
                    console.error(
                        "Error fetching Frisch-Einkauf:",
                        error
                    );
                }
            };

        loadData();

        return () => {
            active = false;
        };
    }, [
        api,
        keycloak,
        props.forceUpdate,
    ]);


    useEffect(() => {
        setAmounts({});
    }, [props.resetKey]);


    // =========================================================================
    // Parent
    // =========================================================================

    useEffect(() => {
        props.handleFrisch?.(
            frischBestellung
        );
    }, [
        frischBestellung,
        props.handleFrisch,
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
    // Discrepancy Lookup
    // =========================================================================

    const discrepancyByProduct =
        useMemo(() => {
            return discrepancy.reduce(
                (
                    result,
                    item
                ) => {
                    const name =
                        item?.bestand
                            ?.name;

                    if (name) {
                        result[name] =
                            item;
                    }

                    return result;
                },
                {}
            );
        }, [discrepancy]);


    // =========================================================================
    // Preis
    // =========================================================================

    const totalPrice =
        useMemo(() => {
            return frischBestellung.reduce(
                (
                    total,
                    item,
                    index
                ) => {
                    const discrepancyItem =
                        discrepancyByProduct[
                            item
                                ?.frischbestand
                                ?.name
                        ];

                    if (
                        item.done !==
                            false ||
                        !discrepancyItem ||
                        Number(
                            discrepancyItem.zuBestellendeGebinde
                        ) === 0
                    ) {
                        return total;
                    }

                    const key =
                        getItemKey(
                            item,
                            index
                        );

                    return (
                        total +
                        Number(
                            amounts[key] ??
                                0
                        ) *
                            Number(
                                item
                                    ?.frischbestand
                                    ?.preis ??
                                    0
                            )
                    );
                },
                0
            );
        }, [
            frischBestellung,
            discrepancyByProduct,
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


    const getStepValue =
        unit => {
            return (
                String(unit ?? "")
                    .toLowerCase() ===
                "kg"
                    ? 0.2
                    : 1
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
                    "frischbestand.name",
            },
            {
                header: "Preis in €",
                accessorKey:
                    "frischbestand.preis",

                cell: info => {
                    const item =
                        info.row.original;

                    return (
                        <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                        >
                            <NumberFormatComponent
                                value={
                                    info.getValue()
                                }
                            />

                            {item
                                ?.frischbestand
                                ?.spezialfallBestelleinheit && (
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    (kg)
                                </Typography>
                            )}
                        </Stack>
                    );
                },
            },
            {
                header:
                    "Gebindegröße",
                accessorKey:
                    "frischbestand.gebindegroesse",

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
                    "Bestellmenge",
                accessorKey:
                    "bestellmenge",

                cell: info => {
                    const item =
                        info.row.original;

                    const difference =
                        discrepancyByProduct[
                            item
                                ?.frischbestand
                                ?.name
                        ];

                    const value =
                        Number(
                            difference
                                ?.zuVielzuWenig ??
                                0
                        );

                    return (
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <NumberFormatComponent
                                value={
                                    info.getValue()
                                }
                                includeFractionDigits={
                                    false
                                }
                            />

                            {item
                                ?.frischbestand
                                ?.spezialfallBestelleinheit &&
                                " Stück"}

                            {difference &&
                                Number(
                                    difference.zuBestellendeGebinde
                                ) !==
                                    0 &&
                                value !==
                                    0 && (
                                    <Chip
                                        size="small"
                                        color={
                                            value >
                                            0
                                                ? "success"
                                                : "error"
                                        }
                                        variant="outlined"
                                        label={
                                            <>
                                                {value >
                                                0
                                                    ? "+"
                                                    : ""}
                                                <NumberFormatComponent
                                                    value={
                                                        value
                                                    }
                                                    includeFractionDigits={
                                                        false
                                                    }
                                                />
                                            </>
                                        }
                                    />
                                )}
                        </Stack>
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

                    const difference =
                        discrepancyByProduct[
                            item
                                ?.frischbestand
                                ?.name
                        ];

                    if (
                        Number(
                            difference
                                ?.zuBestellendeGebinde
                        ) === 0
                    ) {
                        return (
                            <Typography
                                variant="body2"
                                color="error"
                            >
                                Kein Gebinde
                                entstanden
                            </Typography>
                        );
                    }

                    const index =
                        frischBestellung.indexOf(
                            item
                        );

                    const key =
                        getItemKey(
                            item,
                            index
                        );

                    const unavailable =
                        item
                            ?.frischbestand
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

                                    step:
                                        getStepValue(
                                            item
                                                ?.frischbestand
                                                ?.einheit
                                                ?.name
                                        ),
                                },
                            }}
                            onChange={event =>
                                setAmounts(
                                    previous => ({
                                        ...previous,

                                        [key]:
                                            event
                                                .target
                                                .value,
                                    })
                                )
                            }
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
                    "frischbestand.einheit.name",

                cell: info => {
                    const special =
                        info.row.original
                            ?.frischbestand
                            ?.spezialfallBestelleinheit;

                    return (
                        <Typography
                            variant="body2"
                            color={
                                special
                                    ? "error"
                                    : "inherit"
                            }
                            fontWeight={
                                special
                                    ? 700
                                    : 400
                            }
                        >
                            {info.getValue()}
                        </Typography>
                    );
                },
            },
            {
                header: "Kategorie",
                accessorKey:
                    "frischbestand.kategorie.name",
            },
        ],
        [
            frischBestellung,
            discrepancyByProduct,
            amounts,
        ]
    );


    const visibleOrders =
        useMemo(
            () =>
                frischBestellung.filter(
                    item =>
                        item.done ===
                        false
                ),
            [frischBestellung]
        );


    const table =
        useReactTable({
            data: visibleOrders,
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


    if (
        frischBestellung.length === 0
    ) {
        return null;
    }


    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                overflowX: "auto",
            }}
        >
            <Table
                stickyHeader
                size="small"
                sx={{
                    minWidth: 900,
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
                                        header => (
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
                                                                header.column.getIsSorted()
                                                            )
                                                        }
                                                        direction={
                                                            header.column.getIsSorted() ===
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
                                        )
                                    )}
                                </TableRow>
                            )
                        )}
                </TableHead>

                <TableBody>
                    {table
                        .getRowModel()
                        .rows.map(row => {
                            const item =
                                row.original;

                            const difference =
                                discrepancyByProduct[
                                    item
                                        ?.frischbestand
                                        ?.name
                                ];

                            const unavailable =
                                item
                                    ?.frischbestand
                                    ?.verfuegbarkeit ===
                                    false ||
                                Number(
                                    difference
                                        ?.zuBestellendeGebinde
                                ) === 0;

                            return (
                                <TableRow
                                    key={row.id}
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
                            );
                        })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}