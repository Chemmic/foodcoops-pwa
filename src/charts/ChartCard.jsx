import React, {
    useState,
} from "react";

import {
    Box,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";

import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";


/**
 * Rahmen für ein Diagramm: Titel, Legende (ab 2 Serien) und optional
 * eine Tabellenansicht als Alternative zum Diagramm.
 *
 * legend: [{ label, color, shape: "rect" | "line" }]
 */
export function ChartCard({
    title,
    subtitle,
    legend = [],
    table,
    children,
    sx,
}) {
    const [
        view,
        setView,
    ] = useState("chart");


    return (
        <Paper
            elevation={0}
            sx={{
                p: {
                    xs: 2,
                    sm: 2.5,
                },
                border: 1,
                borderColor: "divider",
                minWidth: 0,
                ...sx,
            }}
        >
            <Stack
                direction="row"
                spacing={2}
                sx={{
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    mb: 1.5,
                }}
            >
                <Box
                    sx={{
                        minWidth: 0,
                    }}
                >
                    <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700 }}
                    >
                        {title}
                    </Typography>

                    {subtitle && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>

                {table && (
                    <Tooltip
                        title={
                            view === "chart"
                                ? "Als Tabelle anzeigen"
                                : "Als Diagramm anzeigen"
                        }
                    >
                        <IconButton
                            size="small"
                            onClick={() =>
                                setView(current =>
                                    current === "chart"
                                        ? "table"
                                        : "chart"
                                )
                            }
                            aria-label={
                                view === "chart"
                                    ? "Als Tabelle anzeigen"
                                    : "Als Diagramm anzeigen"
                            }
                            sx={{
                                mt: -0.75,
                                mr: -0.75,
                                color: "text.secondary",
                            }}
                        >
                            {view === "chart"
                                ? <TableRowsOutlinedIcon fontSize="small" />
                                : <BarChartOutlinedIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                )}
            </Stack>


            {legend.length > 1 &&
                view === "chart" && (
                <Stack
                    direction="row"
                    spacing={2}
                    useFlexGap
                    sx={{
                        flexWrap: "wrap",
                        mb: 1,
                    }}
                >
                    {legend.map(item => (
                        <Stack
                            key={item.label}
                            direction="row"
                            spacing={0.75}
                            sx={{ alignItems: "center" }}
                        >
                            <Box
                                sx={
                                    item.shape === "line"
                                        ? {
                                            width: 14,
                                            height: 2,
                                            borderRadius: 1,
                                            bgcolor: item.color,
                                        }
                                        : {
                                            width: 10,
                                            height: 10,
                                            borderRadius: "2px",
                                            bgcolor: item.color,
                                        }
                                }
                            />

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {item.label}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            )}


            {view === "table" && table
                ? table
                : children}
        </Paper>
    );
}


/**
 * Einfache Tabelle für die Tabellenansicht eines Diagramms.
 *
 * columns: [{ key, label, align?, format? }]
 */
export function ChartTable({
    columns,
    rows,
}) {
    return (
        <Box
            sx={{
                overflowX: "auto",
            }}
        >
            <Box
                component="table"
                sx={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 14,

                    "& th, & td": {
                        py: 0.75,
                        px: 1,
                        borderBottom: 1,
                        borderColor: "divider",
                        whiteSpace: "nowrap",
                    },

                    "& th": {
                        color: "text.secondary",
                        fontWeight: 600,
                        textAlign: "left",
                    },

                    "& td": {
                        fontVariantNumeric: "tabular-nums",
                    },
                }}
            >
                <thead>
                    <tr>
                        {columns.map(column => (
                            <th
                                key={column.key}
                                style={{
                                    textAlign: column.align ?? "left",
                                }}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {rows.map((row, index) => (
                        <tr key={row.key ?? index}>
                            {columns.map(column => (
                                <td
                                    key={column.key}
                                    style={{
                                        textAlign: column.align ?? "left",
                                    }}
                                >
                                    {column.format
                                        ? column.format(row[column.key], row)
                                        : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Box>
        </Box>
    );
}
