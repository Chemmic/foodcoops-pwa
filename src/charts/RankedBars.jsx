import React from "react";

import {
    Box,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";


/**
 * Rangliste als horizontale Balken: Name links, Balken, Wert am Ende.
 *
 * items: [{ key, label, value, detail? }]
 */
export function RankedBars({
    items,
    color = "#2a78d6",
    formatValue = value => String(value),
    emptyText = "Keine Daten",
}) {
    if (!items.length) {
        return (
            <Typography
                variant="body2"
                color="text.secondary"
            >
                {emptyText}
            </Typography>
        );
    }


    const max =
        Math.max(
            ...items.map(item => item.value)
        ) || 1;


    return (
        <Stack spacing={1}>
            {items.map(item => (
                <Tooltip
                    key={item.key}
                    title={item.detail ?? ""}
                    placement="top-start"
                    disableHoverListener={!item.detail}
                >
                    <Box
                        tabIndex={item.detail ? 0 : undefined}
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "minmax(90px, 38%) 1fr auto",
                            alignItems: "center",
                            columnGap: 1.5,
                        }}
                    >
                        <Typography
                            variant="body2"
                            noWrap
                            title={item.label}
                        >
                            {item.label}
                        </Typography>

                        <Box
                            sx={{
                                height: 12,
                            }}
                        >
                            <Box
                                sx={{
                                    height: "100%",
                                    width: `${Math.max(2, (item.value / max) * 100)}%`,
                                    bgcolor: color,
                                    borderRadius: "0 4px 4px 0",
                                }}
                            />
                        </Box>

                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 600,
                                fontVariantNumeric: "tabular-nums",
                                minWidth: 48,
                                textAlign: "right",
                            }}
                        >
                            {formatValue(item.value)}
                        </Typography>
                    </Box>
                </Tooltip>
            ))}
        </Stack>
    );
}
