import React from "react";

import {
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";


/**
 * Kennzahl-Kachel: Bezeichnung, Wert, optional Veränderung.
 *
 * delta: { text, direction: "up" | "down" | "flat", good?: boolean }
 *        good weglassen, wenn die Richtung keine Wertung ist.
 */
export function StatTile({
    label,
    value,
    hint,
    delta,
}) {
    const deltaColor =
        !delta ||
        delta.direction === "flat" ||
        delta.good === undefined
            ? "text.secondary"
            : delta.good
                ? "success.main"
                : "error.main";


    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                border: 1,
                borderColor: "divider",
                height: "100%",
                minWidth: 0,
            }}
        >
            <Typography
                variant="body2"
                color="text.secondary"
                noWrap
            >
                {label}
            </Typography>

            <Typography
                variant="h5"
                sx={{
                    fontWeight: 700,
                    mt: 0.5,
                }}
            >
                {value}
            </Typography>

            {delta && (
                <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                        alignItems: "center",
                        mt: 0.5,
                        color: deltaColor,
                    }}
                >
                    {delta.direction === "up" && (
                        <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                    )}

                    {delta.direction === "down" && (
                        <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                    )}

                    <Typography
                        variant="caption"
                        color="inherit"
                    >
                        {delta.text}
                    </Typography>
                </Stack>
            )}

            {hint && !delta && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        display: "block",
                        mt: 0.5,
                    }}
                >
                    {hint}
                </Typography>
            )}
        </Paper>
    );
}
