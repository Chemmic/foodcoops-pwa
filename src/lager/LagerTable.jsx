import React from "react";

import {
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
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
    Typography,
} from "@mui/material";


export function LagerTable({
    columns,
    data,
    dispatchModal,
}) {
    // =========================================================================
    // State
    // =========================================================================

    const [
        sorting,
        setSorting,
    ] =
        React.useState(
            []
        );


    // =========================================================================
    // Table
    // =========================================================================

    const table =
        useReactTable({
            data,
            columns,

            state: {
                sorting,

                /*
                 * Kategorien mit enthaltenen Produkten
                 * standardmäßig aufgeklappt.
                 */
                expanded:
                    true,
            },

            onSortingChange:
                setSorting,

            getSubRows:
                row =>
                    Array.isArray(
                        row?.produkte
                    )
                        ? row.produkte
                        : undefined,

            getCoreRowModel:
                getCoreRowModel(),

            getSortedRowModel:
                getSortedRowModel(),

            getExpandedRowModel:
                getExpandedRowModel(),
        });


    // =========================================================================
    // Row Click
    // =========================================================================

    const handleRowClick =
        row => {
            const rowData =
                row.original;


            if (
                Object.prototype.hasOwnProperty.call(
                    rowData,
                    "produkte"
                )
            ) {
                dispatchModal(
                    "EditKategorieModal",
                    rowData
                );

                return;
            }


            dispatchModal(
                "EditProduktModal",
                rowData
            );
        };


    // =========================================================================
    // Render
    // =========================================================================

    return (
        <TableContainer
            component={
                Paper
            }
            elevation={
                0
            }
            sx={{
                /*
                 * GANZ wichtig:
                 *
                 * Kein maxHeight mit viewport-Berechnung.
                 * Der Parent hat jetzt die korrekte Resthöhe.
                 */
                flex:
                    1,

                minHeight:
                    0,

                height:
                    "100%",

                width:
                    "100%",

                border:
                    1,

                borderColor:
                    "divider",

                borderRadius:
                    2,

                /*
                 * Genau HIER wird gescrollt.
                 */
                overflow:
                    "auto",

                /*
                 * Der native Scrollbar bleibt innerhalb
                 * des Tabellenbereichs.
                 */
                overscrollBehavior:
                    "contain",
            }}
        >
            <Table
                stickyHeader
                size="small"
                aria-label="Lagerbestand"
                sx={{
                    width:
                        "100%",

                    minWidth:
                        780,

                    /*
                     * Die Tabelle selbst darf länger als
                     * der Container werden.
                     *
                     * TableContainer übernimmt das Scrollen.
                     */
                    "& td, & th": {
                        whiteSpace:
                            "normal",

                        overflowWrap:
                            "break-word",
                    },
                }}
            >
                {/* ========================================================= */}
                {/* Header                                                    */}
                {/* ========================================================= */}

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


                                            const sortable =
                                                header.column.getCanSort();


                                            return (
                                                <TableCell
                                                    key={
                                                        header.id
                                                    }
                                                    sortDirection={
                                                        sorted ===
                                                        "asc"
                                                            ? "asc"
                                                            : sorted ===
                                                                "desc"
                                                                ? "desc"
                                                                : false
                                                    }
                                                    sx={{
                                                        fontWeight:
                                                            700,

                                                        bgcolor:
                                                            "background.paper",

                                                        /*
                                                         * Sticky Header soll
                                                         * sauber über den
                                                         * Tabellenzeilen liegen.
                                                         */
                                                        zIndex:
                                                            2,
                                                    }}
                                                >
                                                    {header.isPlaceholder
                                                        ? null
                                                        : sortable
                                                            ? (
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
                                                            )
                                                            : (
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


                {/* ========================================================= */}
                {/* Body                                                      */}
                {/* ========================================================= */}

                <TableBody>
                    {table
                        .getRowModel()
                        .rows
                        .map(
                            row => {
                                const isCategory =
                                    Object.prototype.hasOwnProperty.call(
                                        row.original,
                                        "produkte"
                                    );


                                // -------------------------------------------------
                                // Kategorie
                                // -------------------------------------------------

                                if (
                                    isCategory
                                ) {
                                    return (
                                        <TableRow
                                            key={
                                                row.id
                                            }
                                            hover
                                            onClick={() =>
                                                handleRowClick(
                                                    row
                                                )
                                            }
                                            sx={{
                                                cursor:
                                                    "pointer",

                                                "& td": {
                                                    bgcolor:
                                                        "action.hover",
                                                },
                                            }}
                                        >
                                            <TableCell
                                                colSpan={
                                                    columns.length
                                                }
                                            >
                                                <Box
                                                    sx={{
                                                        display:
                                                            "flex",

                                                        alignItems:
                                                            "center",

                                                        justifyContent:
                                                            "space-between",

                                                        gap:
                                                            2,
                                                    }}
                                                >
                                                    <Typography
                                                        variant="subtitle1"
                                                        fontWeight={
                                                            700
                                                        }
                                                    >
                                                        {
                                                            row
                                                                .original
                                                                .name
                                                        }
                                                    </Typography>


                                                    <Chip
                                                        size="small"
                                                        label={
                                                            `${
                                                                row
                                                                    .original
                                                                    .produkte
                                                                    ?.length ??
                                                                0
                                                            } Produkte`
                                                        }
                                                    />
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                }


                                // -------------------------------------------------
                                // Produkt
                                // -------------------------------------------------

                                return (
                                    <TableRow
                                        key={
                                            row.id
                                        }
                                        hover
                                        onClick={() =>
                                            handleRowClick(
                                                row
                                            )
                                        }
                                        sx={{
                                            cursor:
                                                "pointer",

                                            "&:last-child td":
                                                {
                                                    borderBottom:
                                                        0,
                                                },
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
                            }
                        )}


                    {/* ===================================================== */}
                    {/* Leerzustand                                           */}
                    {/* ===================================================== */}

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
                                Keine Lagerprodukte vorhanden.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}