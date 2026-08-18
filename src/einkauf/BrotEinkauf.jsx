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
import { useAuth } from "../auth/AuthContext.jsx";

import NumberFormatComponent from "../logic/NumberFormatComponent.jsx";


const getItemKey = (item, index) =>
    item?.id ?? `brot-${index}`;


export function BrotEinkauf(props) {
    const api = useApi();

    const { keycloak } =
        useAuth();

    const [
        brotBestellung,
        setBrotBestellung,
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

        const fetchBrotBestellung =
            async () => {
                try {
                    const personId =
                        keycloak
                            ?.tokenParsed
                            ?.preferred_username;

                    if (!personId) {
                        return;
                    }

                    const response =
                        await api.readBrotBestellungBetweenDatesProPerson(
                            personId
                        );

                    if (!response.ok) {
                        return;
                    }

                    const data =
                        await response.json();

                    const orders =
                        data?._embedded
                            ?.brotBestellungRepresentationList;

                    if (
                        active &&
                        Array.isArray(
                            orders
                        )
                    ) {
                        setBrotBestellung(
                            orders
                        );
                    }
                } catch (error) {
                    console.error(
                        "Error fetching brotBestellung:",
                        error
                    );
                }
            };

        fetchBrotBestellung();

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
    // Parent informieren
    // =========================================================================

    useEffect(() => {
        props.handleBrot?.(
            brotBestellung
        );
    }, [
        brotBestellung,
        props.handleBrot,
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
            return brotBestellung.reduce(
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

                    return (
                        total +
                        Number(
                            amounts[key] ??
                                0
                        ) *
                            Number(
                                item
                                    ?.brotbestand
                                    ?.preis ??
                                    0
                            )
                    );
                },
                0
            );
        }, [
            brotBestellung,
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
    // Columns
    // =========================================================================

    const columns = useMemo(
        () => [
            {
                header: "Produkt",
                accessorKey:
                    "brotbestand.name",
            },
            {
                header: "Preis in €",
                accessorKey:
                    "brotbestand.preis",

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
                    "Bestellmenge",
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
            {
                id: "menge",
                header:
                    "Genommene Menge",
                enableSorting: false,

                cell: info => {
                    const item =
                        info.row.original;

                    const index =
                        brotBestellung.indexOf(
                            item
                        );

                    const key =
                        getItemKey(
                            item,
                            index
                        );

                    const unavailable =
                        item
                            ?.brotbestand
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
        ],
        [
            brotBestellung,
            amounts,
        ]
    );


    const table =
        useReactTable({
            data: brotBestellung,
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
        brotBestellung.length === 0
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
                    minWidth: 650,
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
                                    ?.brotbestand
                                    ?.verfuegbarkeit ===
                                false;

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