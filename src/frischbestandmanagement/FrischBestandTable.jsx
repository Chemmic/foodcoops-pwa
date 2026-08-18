import React from "react";

import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
} from "@mui/material";


export function FrischBestandTable({
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
            },

            onSortingChange:
                setSorting,

            getCoreRowModel:
                getCoreRowModel(),

            getSortedRowModel:
                getSortedRowModel(),
        });


    // =========================================================================
    // Boolean Darstellung
    // =========================================================================

    const renderBoolean =
        value => (
            <Chip
                size="small"
                label={
                    value
                        ? "Ja"
                        : "Nein"
                }
                color={
                    value
                        ? "success"
                        : "default"
                }
                variant={
                    value
                        ? "filled"
                        : "outlined"
                }
            />
        );


    // =========================================================================
    // Render
    // =========================================================================

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{
                /*
                 * Genau wie Lager:
                 *
                 * Der Parent gibt die verfügbare Resthöhe vor.
                 * Der TableContainer nimmt diese vollständig ein.
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
                 * Ausschließlich hier wird gescrollt.
                 */
                overflow:
                    "auto",

                overscrollBehavior:
                    "contain",
            }}
        >
            <Table
                stickyHeader
                size="small"
                aria-label="Frischbestand"
                sx={{
                    width:
                        "100%",

                    /*
                     * Wegen der vielen Spalten darf die Tabelle
                     * horizontal breiter als der Viewport sein.
                     */
                    minWidth:
                        1050,

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
                            row => (
                                <TableRow
                                    key={
                                        row.id
                                    }
                                    hover
                                    onClick={() =>
                                        dispatchModal(
                                            "EditFrischBestandModal",
                                            row.original
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
                                            cell => {
                                                const columnId =
                                                    cell.column.id;


                                                const value =
                                                    cell.getValue();


                                                const booleanColumn =
                                                    columnId ===
                                                        "verfuegbarkeit" ||
                                                    columnId ===
                                                        "spezialfallBestelleinheit";


                                                return (
                                                    <TableCell
                                                        key={
                                                            cell.id
                                                        }
                                                    >
                                                        {booleanColumn
                                                            ? renderBoolean(
                                                                Boolean(
                                                                    value
                                                                )
                                                            )
                                                            : flexRender(
                                                                cell
                                                                    .column
                                                                    .columnDef
                                                                    .cell,

                                                                cell.getContext()
                                                            )}
                                                    </TableCell>
                                                );
                                            }
                                        )}
                                </TableRow>
                            )
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
                                Keine Frischprodukte vorhanden.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}