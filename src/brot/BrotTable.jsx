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
    useMediaQuery,
    useTheme,
} from "@mui/material";

import HelpOutlinedIcon
    from "@mui/icons-material/HelpOutlined";

import HistoryOutlinedIcon
    from "@mui/icons-material/HistoryOutlined";


export function BrotTable({
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
    // Responsive
    // =========================================================================

    const theme =
        useTheme();


    const isSmallScreen =
        useMediaQuery(
            theme.breakpoints.down(
                "sm"
            )
        );


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
    // Tabelle
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
            spacing={{
                xs:
                    0.75,

                sm:
                    1.5,
            }}
            sx={{
                flex:
                    1,

                minHeight:
                    0,

                overflow:
                    "hidden",
            }}
        >
            {/* ============================================================= */}
            {/* Vorwoche                                                      */}
            {/* ============================================================= */}

            <Stack
                direction="row"
                spacing={
                    1
                }
                alignItems="center"
                sx={{
                    flexShrink:
                        0,

                    justifyContent: {
                        xs:
                            "space-between",

                        sm:
                            "flex-end",
                    },
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
                    <IconButton
                        size={
                            isSmallScreen
                                ? "small"
                                : "medium"
                        }
                    >
                        <HelpOutlinedIcon />
                    </IconButton>
                </Tooltip>


                <Button
                    variant="outlined"
                    size={
                        isSmallScreen
                            ? "small"
                            : "medium"
                    }
                    startIcon={
                        <HistoryOutlinedIcon />
                    }
                    onClick={
                        loadPreviousWeek
                    }
                    sx={{
                        whiteSpace:
                            "nowrap",
                    }}
                >
                    {
                        isSmallScreen
                            ? "Vorwoche laden"
                            : "Bestellmenge Vorwoche laden"
                    }
                </Button>
            </Stack>


            {/* ============================================================= */}
            {/* Tabelle                                                       */}
            {/* ============================================================= */}

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

                    WebkitOverflowScrolling:
                        "touch",
                }}
            >
                <Table
                    stickyHeader
                    size="small"
                    aria-label="Brotbestellung"
                    sx={{
                        minWidth:
                            800,
                    }}
                >
                    {/* ===================================================== */}
                    {/* Header                                                */}
                    {/* ===================================================== */}

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
                                                    header
                                                        .column
                                                        .getIsSorted();


                                                const stickyBreadName =
                                                    isSmallScreen &&
                                                    header
                                                        .column
                                                        .id ===
                                                        "name";


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

                                                            ...(stickyBreadName
                                                                ? {
                                                                    position:
                                                                        "sticky",

                                                                    left:
                                                                        0,

                                                                    zIndex:
                                                                        4,

                                                                    borderRight:
                                                                        1,

                                                                    borderRightColor:
                                                                        "divider",
                                                                }
                                                                : {}),
                                                        }}
                                                    >
                                                        {header
                                                            .column
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
                                                                    header
                                                                        .column
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


                    {/* ===================================================== */}
                    {/* Body                                                  */}
                    {/* ===================================================== */}

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
                                                        const stickyBreadName =
                                                            isSmallScreen &&
                                                            cell
                                                                .column
                                                                .id ===
                                                                "name";


                                                        // =================================================
                                                        // Bestellmenge
                                                        // =================================================

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
                                                                                        1,
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


                                                        // =================================================
                                                        // Normale Zelle
                                                        // =================================================

                                                        return (
                                                            <TableCell
                                                                key={
                                                                    cell.id
                                                                }
                                                                sx={{
                                                                    ...(stickyBreadName
                                                                        ? {
                                                                            position:
                                                                                "sticky",

                                                                            left:
                                                                                0,

                                                                            zIndex:
                                                                                1,

                                                                            bgcolor:
                                                                                "background.paper",

                                                                            borderRight:
                                                                                1,

                                                                            borderRightColor:
                                                                                "divider",
                                                                        }
                                                                        : {}),
                                                                }}
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


                        {/* ================================================= */}
                        {/* Keine Produkte                                    */}
                        {/* ================================================= */}

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
                                    Keine Brotprodukte vorhanden.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    );
}