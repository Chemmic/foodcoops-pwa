import React from "react";

import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Box,
    Chip,
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
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";

import HelpOutlinedIcon
    from "@mui/icons-material/HelpOutlined";


const ALLERGEN_LABELS = {
    eier:
        "Eier",

    milch:
        "Milch",

    sesam:
        "Sesam",

    schalenfruechte:
        "Schalenfrüchte",

    sellerie:
        "Sellerie",

    soja:
        "Soja",
};


function formatGetreideName(
    value
) {
    if (
        !value ||
        typeof value !==
            "string"
    ) {
        return "";
    }


    return value
        .toLowerCase()
        .replace(
            /_/g,
            " "
        )
        .replace(
            /\b\w/g,
            character =>
                character.toUpperCase()
        );
}


function getVisibleAllergenEntries(
    allergenInfo
) {
    if (
        !allergenInfo
    ) {
        return [];
    }


    const entries =
        [];


    if (
        Array.isArray(
            allergenInfo.getreide
        ) &&
        allergenInfo.getreide
            .length >
        0
    ) {
        entries.push({
            label:
                "Getreide",

            value:
                allergenInfo
                    .getreide
                    .map(
                        formatGetreideName
                    )
                    .join(
                        ", "
                    ),
        });
    }


    Object.entries(
        ALLERGEN_LABELS
    ).forEach(
        (
            [
                key,
                label,
            ]
        ) => {
            if (
                allergenInfo[
                    key
                ] ===
                true
            ) {
                entries.push({
                    label,

                    value:
                        null,
                });
            }
        }
    );


    if (
        typeof allergenInfo.hinweis ===
            "string" &&
        allergenInfo.hinweis
            .trim()
    ) {
        entries.push({
            label:
                "Hinweis",

            value:
                allergenInfo
                    .hinweis
                    .trim(),
        });
    }


    return entries;
}


function AllergenInfo({
    allergenInfo,
}) {
    const entries =
        getVisibleAllergenEntries(
            allergenInfo
        );


    if (
        entries.length ===
        0
    ) {
        return null;
    }


    return (
        <Tooltip
            arrow
            placement="right"
            title={
                <Box>
                    <Typography
                        variant="subtitle2"
                        fontWeight={
                            700
                        }
                        gutterBottom
                    >
                        Allergene
                    </Typography>


                    <Stack
                        spacing={
                            0.5
                        }
                    >
                        {entries.map(
                            (
                                entry,
                                index
                            ) => (
                                <Typography
                                    key={
                                        `${entry.label}-${index}`
                                    }
                                    variant="body2"
                                >
                                    <strong>
                                        {
                                            entry.label
                                        }
                                    </strong>

                                    {
                                        entry.value
                                            ? `: ${entry.value}`
                                            : ""
                                    }
                                </Typography>
                            )
                        )}
                    </Stack>
                </Box>
            }
        >
            <IconButton
                size="small"
                aria-label="Allergeninformationen anzeigen"
                onClick={
                    event =>
                        event.stopPropagation()
                }
            >
                <HelpOutlinedIcon
                    fontSize="small"
                />
            </IconButton>
        </Tooltip>
    );
}


export function BrotBestandTable({
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

                overflow:
                    "auto",

                overscrollBehavior:
                    "contain",

                WebkitOverflowScrolling:
                    "touch",
            }}
        >
            <Table
                stickyHeader
                size="small"
                aria-label="Brotbestand"
                sx={{
                    width:
                        "100%",

                    minWidth:
                        720,

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
                                                header
                                                    .column
                                                    .getIsSorted();


                                            const sortable =
                                                header
                                                    .column
                                                    .getCanSort();


                                            const stickyProduct =
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
                                                            stickyProduct
                                                                ? 4
                                                                : 2,

                                                        ...(stickyProduct
                                                            ? {
                                                                position:
                                                                    "sticky",

                                                                left:
                                                                    0,

                                                                minWidth:
                                                                    160,

                                                                maxWidth:
                                                                    160,

                                                                borderRight:
                                                                    1,

                                                                borderRightColor:
                                                                    "divider",
                                                            }
                                                            : {}),
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
                                                            )
                                                            : (
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


                {/* ========================================================= */}
                {/* Body                                                      */}
                {/* ========================================================= */}

                <TableBody>
                    {table
                        .getRowModel()
                        .rows
                        .map(
                            row => {
                                const produkt =
                                    row.original;


                                return (
                                    <TableRow
                                        key={
                                            row.id
                                        }
                                        hover
                                        onClick={() =>
                                            dispatchModal(
                                                "EditBrotBestandModal",
                                                produkt
                                            )
                                        }
                                        sx={{
                                            cursor:
                                                "pointer",

                                            opacity:
                                                produkt.verfuegbarkeit
                                                    ? 1
                                                    : 0.55,

                                            "&:last-child td": {
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
                                                        cell
                                                            .column
                                                            .id;


                                                    const stickyProduct =
                                                        isSmallScreen &&
                                                        columnId ===
                                                            "name";


                                                    return (
                                                        <TableCell
                                                            key={
                                                                cell.id
                                                            }
                                                            sx={{
                                                                ...(stickyProduct
                                                                    ? {
                                                                        position:
                                                                            "sticky",

                                                                        left:
                                                                            0,

                                                                        zIndex:
                                                                            1,

                                                                        minWidth:
                                                                            160,

                                                                        maxWidth:
                                                                            160,

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
                                                            {
                                                                columnId ===
                                                                "name" ? (
                                                                    <Stack
                                                                        direction="row"
                                                                        alignItems="center"
                                                                        spacing={
                                                                            0.5
                                                                        }
                                                                    >
                                                                        <Typography
                                                                            variant="body2"
                                                                            fontWeight={
                                                                                600
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
                                                                        </Typography>


                                                                        <AllergenInfo
                                                                            allergenInfo={
                                                                                produkt.allergenInfo
                                                                            }
                                                                        />
                                                                    </Stack>
                                                                ) : columnId ===
                                                                  "verfuegbarkeit" ? (
                                                                    <Chip
                                                                        size="small"
                                                                        color={
                                                                            produkt.verfuegbarkeit
                                                                                ? "success"
                                                                                : "default"
                                                                        }
                                                                        variant={
                                                                            produkt.verfuegbarkeit
                                                                                ? "filled"
                                                                                : "outlined"
                                                                        }
                                                                        label={
                                                                            produkt.verfuegbarkeit
                                                                                ? "Verfügbar"
                                                                                : "Nicht verfügbar"
                                                                        }
                                                                    />
                                                                ) : (
                                                                    flexRender(
                                                                        cell
                                                                            .column
                                                                            .columnDef
                                                                            .cell,

                                                                        cell
                                                                            .getContext()
                                                                    )
                                                                )
                                                            }
                                                        </TableCell>
                                                    );
                                                }
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
                                Keine Brotprodukte vorhanden.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}