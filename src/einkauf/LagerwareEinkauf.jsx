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

import { toast } from "react-toastify";

import { useApi } from "../ApiService.jsx";
import NumberFormatComponent from "../logic/NumberFormatComponent.jsx";


const getItemKey = (item, index) =>
    item?.id ?? `lager-${index}`;


export function LagerwareEinkauf(props) {
    const api = useApi();

    const [
        produkt,
        setProdukt,
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

        const fetchProdukt =
            async () => {
                try {
                    const response =
                        await api.readProdukt();

                    if (!response.ok) {
                        return;
                    }

                    const data =
                        await response.json();

                    const products =
                        data?._embedded
                            ?.produktRepresentationList;

                    if (
                        active &&
                        Array.isArray(
                            products
                        )
                    ) {
                        setProdukt(
                            products
                        );
                    }
                } catch (error) {
                    console.error(
                        "Error fetching produkt:",
                        error
                    );
                }
            };

        fetchProdukt();

        return () => {
            active = false;
        };
    }, [
        api,
        props.forceUpdate,
    ]);


    useEffect(() => {
        setAmounts({});
    }, [props.resetKey]);


    // =========================================================================
    // Parent informieren
    // =========================================================================

    useEffect(() => {
        props.handleProdukt?.(
            produkt
        );
    }, [
        produkt,
        props.handleProdukt,
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
            return produkt.reduce(
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
                                item.preis ??
                                    0
                            )
                    );
                },
                0
            );
        }, [
            produkt,
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
    // Menge ändern
    // =========================================================================

    const handleAmountChange = (
        item,
        index,
        rawValue
    ) => {
        const max =
            Number(
                item?.lagerbestand
                    ?.istLagerbestand ??
                    0
            );

        let value =
            rawValue === ""
                ? ""
                : Math.max(
                    0,
                    Number(rawValue)
                );

        if (
            value !== "" &&
            value > max
        ) {
            value = max;

            toast.info(
                `Momentan sind nur ${max} ${item?.lagerbestand?.einheit?.name ?? ""} ${item.name} verfügbar.`
            );
        }

        const key =
            getItemKey(
                item,
                index
            );

        setAmounts(previous => ({
            ...previous,

            [key]: value,
        }));
    };


    // =========================================================================
    // Columns
    // =========================================================================

    const columns = useMemo(
        () => [
            {
                header: "Produkt",
                accessorKey: "name",
            },
            {
                header: "Preis in €",
                accessorKey: "preis",

                cell: info => (
                    <NumberFormatComponent
                        value={
                            info.getValue()
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
                        produkt.indexOf(
                            item
                        );

                    const key =
                        getItemKey(
                            item,
                            index
                        );

                    const max =
                        Number(
                            item
                                ?.lagerbestand
                                ?.istLagerbestand ??
                                0
                        );

                    return (
                        <TextField
                            size="small"
                            type="number"
                            value={
                                amounts[key] ??
                                ""
                            }
                            disabled={
                                max <= 0
                            }
                            slotProps={{
                                htmlInput: {
                                    min: 0,
                                    max,
                                },
                            }}
                            onChange={event =>
                                handleAmountChange(
                                    item,
                                    index,
                                    event.target
                                        .value
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
                    "lagerbestand.einheit.name",
            },
        ],
        [
            produkt,
            amounts,
        ]
    );


    const table =
        useReactTable({
            data: produkt,
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


    if (produkt.length === 0) {
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
                                Number(
                                    row
                                        .original
                                        ?.lagerbestand
                                        ?.istLagerbestand ??
                                        0
                                ) <= 0;

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