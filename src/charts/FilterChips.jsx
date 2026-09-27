import React from "react";

import {
    Chip,
    Stack,
} from "@mui/material";

import { alpha } from "@mui/material/styles";


/**
 * Einfachauswahl als Chips (z.B. Zeitraum). Ausgewählt wie die aktive
 * Navigation: dezente Primärfläche mit dunkler Primärschrift.
 *
 * options: [{ value, label }]
 */
export function FilterChips({
    options,
    value,
    onChange,
    ariaLabel,
    sx,
}) {
    return (
        <Stack
            direction="row"
            spacing={1}
            useFlexGap
            role="radiogroup"
            aria-label={ariaLabel}
            sx={{
                flexWrap: "wrap",
                ...sx,
            }}
        >
            {options.map(option => {
                const aktiv =
                    option.value === value;

                return (
                    <Chip
                        key={option.value}
                        label={option.label}
                        clickable
                        role="radio"
                        aria-checked={aktiv}
                        variant="outlined"
                        onClick={() =>
                            !aktiv && onChange(option.value)
                        }
                        sx={theme => ({
                            height: 34,
                            px: 0.5,

                            ...(aktiv && {
                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                                borderColor: theme.palette.primary.light,
                                color: theme.palette.primary.dark,

                                "&:hover, &.MuiChip-clickable:hover": {
                                    bgcolor: alpha(theme.palette.primary.main, 0.18),
                                },
                            }),

                            ...(!aktiv && {
                                color: "text.secondary",
                                fontWeight: 500,
                            }),
                        })}
                    />
                );
            })}
        </Stack>
    );
}
