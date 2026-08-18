import React from "react";

import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Box,
    Button,
    IconButton,
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
    Tooltip,
    Typography,
} from "@mui/material";

import HistoryOutlinedIcon
    from "@mui/icons-material/HistoryOutlined";

import HelpOutlinedIcon
    from "@mui/icons-material/HelpOutlined";


export function BestellungTable({
    columns,
    data = [],
    amounts = {},
    onAmountsChange,
    onPriceChange,
}) {
    const [
        sorting,
        setSorting,
    ] =
        React.useState([]);


    // =========================================================================
    // Preis
    // =========================================================================

    const totalPrice =
        React.useMemo(
            () =>
                data.reduce(
                    (
                        total,
                        product
                    ) => {
                        const amount =
                            Number(
                                amounts[
                                    product.id
                                ] ??
                                0
                            );


                        const price =
                            Number(
                                product.preis ??
                                0
                            );


                        return (
                            total +
                            amount *
                                price
                        );
                    },
                    0
                ),
            [
                data,
                amounts,
            ]
        );


    React.useEffect(
        () => {
            onPriceChange?.(
                totalPrice
            );
        },
        [
            totalPrice,
            onPriceChange,
        ]
    );


    // =========================================================================
    // Vorwoche
    // =========================================================================

    const loadPreviousWeek =
        () => {
            const values =
                {};


            data.forEach(
                product => {
                    if (
                        product.bestellmengeAlt !=
                        null
                    ) {
                        values[
                            product.id
                        ] =
                            product.bestellmengeAlt;
                    }
                }
            );


            onAmountsChange?.(
                values
            );
        };


    // =========================================================================
    // Table
    // =========================================================================

    const table =
        useReactTable({
            data,
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


    return (
        <Stack
            spacing={
                1.5
            }
            sx={{
                flex:
                    1,

                minHeight:
                    0,

                overflow:
                    "hidden",
            }}
        >
            <Stack
                direction="row"
                spacing={
                    1
                }
                justifyContent="flex-end"
                alignItems="center"
                sx={{
                    flexShrink:
                        0,
                }}
            >
                <Tooltip
                    arrow
                    title={
                        <Box>
                            <Typography
                                fontWeight={
                                    700
                                }
                            >
                                Bestellung der Vorwoche
                            </Typography>


                            <Typography
                                variant="body2"
                            >
                                Übernimmt deine Mengen der Vorwoche
                                in die Eingabefelder.
                            </Typography>
                        </Box>
                    }
                >
                    <IconButton>
                        <HelpOutlinedIcon />
                    </IconButton>
                </Tooltip>


                <Button
                    variant="outlined"
                    startIcon={
                        <HistoryOutlinedIcon />
                    }
                    onClick={
                        loadPreviousWeek
                    }
                >
                    Bestellmenge Vorwoche laden
                </Button>
            </Stack>


            <TableContainer
                component={
                    Paper
                }
                elevation={
                    0
                }
                sx={{
                    flex:
                        1,

                    minHeight:
                        0,

                    width:
                        "100%",

                    border:
                        1,

                    borderColor:
                        "divider",

                    borderRadius:
                        2,

                    overflow:
                        "auto",
                }}
            >
                <Table
                    stickyHeader
                    size="small"
                    sx={{
                        minWidth:
                            1200,
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
                                                    header.column
                                                        .getIsSorted();


                                                return (
                                                    <TableCell
                                                        key={
                                                            header.id
                                                        }
                                                        sx={{
                                                            fontWeight:
                                                                700,

                                                            bgcolor:
                                                                "background.paper",
                                                        }}
                                                    >
                                                        {header.column
                                                            .getCanSort() ? (
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
                                                                    header.column
                                                                        .getToggleSortingHandler()
                                                                }
                                                            >
                                                                {flexRender(
                                                                    header
                                                                        .column
                                                                        .columnDef
                                                                        .header,

                                                                    header
                                                                        .getContext()
                                                                )}
                                                            </TableSortLabel>
                                                        ) : (
                                                            flexRender(
                                                                header
                                                                    .column
                                                                    .columnDef
                                                                    .header,

                                                                header
                                                                    .getContext()
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
                            .rows
                            .map(
                                row => {
                                    const product =
                                        row.original;


                                    const unavailable =
                                        product.verfuegbarkeit ===
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
                                                    cell => {
                                                        if (
                                                            cell
                                                                .column
                                                                .id ===
                                                            "bestellmenge"
                                                        ) {
                                                            return (
                                                                <TableCell
                                                                    key={
                                                                        cell.id
                                                                    }
                                                                >
                                                                    <TextField
                                                                        size="small"
                                                                        type="number"
                                                                        value={
                                                                            amounts[
                                                                                product.id
                                                                            ] ??
                                                                            ""
                                                                        }
                                                                        placeholder={
                                                                            product.bestellmengeAlt !=
                                                                            null
                                                                                ? `Vorwoche: ${product.bestellmengeAlt}`
                                                                                : ""
                                                                        }
                                                                        disabled={
                                                                            unavailable
                                                                        }
                                                                        slotProps={{
                                                                            htmlInput:
                                                                                {
                                                                                    min:
                                                                                        0,

                                                                                    step:
                                                                                        product
                                                                                            ?.einheit
                                                                                            ?.name
                                                                                            ?.toLowerCase() ===
                                                                                        "kg"
                                                                                            ? 0.2
                                                                                            : 1,
                                                                                },
                                                                        }}
                                                                        onChange={
                                                                            event =>
                                                                                onAmountsChange?.(
                                                                                    {
                                                                                        ...amounts,

                                                                                        [product.id]:
                                                                                            event
                                                                                                .target
                                                                                                .value,
                                                                                    }
                                                                                )
                                                                        }
                                                                        sx={{
                                                                            width:
                                                                                130,
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                            );
                                                        }


                                                        return (
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

                                                                    cell
                                                                        .getContext()
                                                                )}
                                                            </TableCell>
                                                        );
                                                    }
                                                )}
                                        </TableRow>
                                    );
                                }
                            )}


                        {table
                            .getRowModel()
                            .rows
                            .length ===
                            0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={
                                        columns.length
                                    }
                                    align="center"
                                    sx={{
                                        py:
                                            6,

                                        color:
                                            "text.secondary",
                                    }}
                                >
                                    Keine Frischprodukte vorhanden.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    );
}