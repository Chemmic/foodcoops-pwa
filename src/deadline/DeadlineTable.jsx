import React from "react";

import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";


function formatTime(time) {
    if (!time) {
        return "–";
    }


    /*
     * Backend liefert typischerweise HH:mm:ss.
     *
     * Wir benötigen in der Oberfläche nur HH:mm.
     */
    const match =
        String(time).match(
            /^(\d{2}):(\d{2})/
        );


    if (!match) {
        return time;
    }


    return `${match[1]}:${match[2]}`;
}


export function DeadlineTable({
    columns,
    data,
}) {
    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{
                width: "100%",
                maxWidth: 700,

                border: 1,
                borderColor: "divider",

                borderRadius: 2,

                overflow: "hidden",
            }}
        >
            <Table
                size="small"
                aria-label="Aktuelle Bestell-Deadline"
            >
                <TableHead>
                    <TableRow>
                        {columns.map(
                            column => (
                                <TableCell
                                    key={
                                        column.accessorKey
                                    }
                                    sx={{
                                        fontWeight:
                                            700,
                                    }}
                                >
                                    {
                                        column.header
                                    }
                                </TableCell>
                            )
                        )}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={
                                    columns.length
                                }
                                align="center"
                                sx={{
                                    py: 5,
                                }}
                            >
                                <Typography
                                    color="text.secondary"
                                >
                                    Es wurde
                                    noch keine
                                    Deadline
                                    angelegt.
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map(
                            deadline => (
                                <TableRow
                                    key={
                                        deadline.id
                                    }
                                    hover
                                >
                                    <TableCell>
                                        {
                                            deadline.weekday
                                        }
                                    </TableCell>

                                    <TableCell>
                                        {formatTime(
                                            deadline.time
                                        )}{" "}
                                        Uhr
                                    </TableCell>
                                </TableRow>
                            )
                        )
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}