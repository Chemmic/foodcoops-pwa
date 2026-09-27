import React from "react";

import {
    Box,
    Paper,
    Stack,
    Typography,
} from "@mui/material";


/**
 * Tooltip für Diagramme: Wert zuerst (kräftig), Serienname danach.
 * Serien werden mit einem kurzen Strich in ihrer Farbe markiert.
 */
export function ChartTooltip({
    x,
    y,
    containerWidth,
    title,
    rows,
}) {
    const flipLeft =
        x > containerWidth - 200;

    return (
        <Paper
            elevation={3}
            role="status"
            sx={{
                position: "absolute",
                top: Math.max(0, y),
                left: flipLeft
                    ? undefined
                    : x + 12,
                right: flipLeft
                    ? containerWidth - x + 12
                    : undefined,

                px: 1.5,
                py: 1,

                minWidth: 140,
                pointerEvents: "none",
                zIndex: 2,
            }}
        >
            {title && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        display: "block",
                        mb: 0.5,
                    }}
                >
                    {title}
                </Typography>
            )}

            <Stack spacing={0.25}>
                {rows.map(row => (
                    <Stack
                        key={row.label}
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: "center" }}
                    >
                        {row.color && (
                            <Box
                                sx={{
                                    width: 12,
                                    height: 2,
                                    borderRadius: 1,
                                    bgcolor: row.color,
                                    flexShrink: 0,
                                }}
                            />
                        )}

                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 700,
                                fontVariantNumeric: "tabular-nums",
                            }}
                        >
                            {row.value}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {row.label}
                        </Typography>
                    </Stack>
                ))}
            </Stack>
        </Paper>
    );
}
