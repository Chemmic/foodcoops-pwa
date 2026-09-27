import React from "react";

import {
    Box,
    IconButton,
    Tooltip,
    Typography,
} from "@mui/material";

import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";

import {
    OHNE_ROLLE,
    rollenInfo,
} from "../../auth/rollenInfo.js";


function Liste({ eintraege }) {
    return (
        <Box
            component="ul"
            sx={{
                m: 0,
                mt: 0.5,
                pl: 2.25,
            }}
        >
            {eintraege.map(eintrag => (
                <Typography
                    key={eintrag}
                    component="li"
                    variant="body2"
                >
                    {eintrag}
                </Typography>
            ))}
        </Box>
    );
}


/**
 * Kleines "?" mit Tooltip. Liegt es in einem Checkbox-Label, schaltet ein
 * Klick darauf die Checkbox nicht um. Auf dem Handy per Antippen.
 */
function Hilfe({ label, children }) {
    return (
        <Tooltip
            arrow
            placement="right"
            enterTouchDelay={0}
            leaveTouchDelay={6000}
            title={
                <Box
                    sx={{
                        maxWidth: 340,
                        p: 0.5,
                    }}
                >
                    {children}
                </Box>
            }
        >
            <IconButton
                size="small"
                aria-label={label}
                onClick={event => {
                    // Nicht die Checkbox des Labels umschalten
                    event.preventDefault();
                    event.stopPropagation();
                }}
                sx={{
                    p: 0.25,
                    color: "text.secondary",
                }}
            >
                <HelpOutlineOutlinedIcon
                    sx={{
                        fontSize: 18,
                    }}
                />
            </IconButton>
        </Tooltip>
    );
}


/** Was sieht man mit dieser Rolle? */
export function RollenHilfe({ name, beschreibung }) {
    const info =
        rollenInfo(name, beschreibung);

    return (
        <Hilfe label={`Was darf die Rolle ${name}?`}>
            <Typography
                variant="subtitle2"
                sx={{
                    fontWeight: 700,
                }}
            >
                {name}
            </Typography>

            <Typography variant="body2">
                {info.kurz}
            </Typography>

            {info.bereiche.length > 0 && (
                <>
                    <Typography
                        variant="caption"
                        sx={{
                            display: "block",
                            mt: 1,
                            fontWeight: 700,
                        }}
                    >
                        Sieht zusätzlich:
                    </Typography>

                    <Liste eintraege={info.bereiche} />
                </>
            )}

            {info.hinweis && (
                <Typography
                    variant="caption"
                    sx={{
                        display: "block",
                        mt: 1,
                        opacity: 0.85,
                    }}
                >
                    {info.hinweis}
                </Typography>
            )}
        </Hilfe>
    );
}


/** Überblick: was sieht man ganz ohne Rolle? */
export function OhneRolleHilfe() {
    return (
        <Hilfe label="Was sieht man ohne Rolle?">
            <Typography
                variant="subtitle2"
                sx={{
                    fontWeight: 700,
                }}
            >
                Ohne Rolle
            </Typography>

            <Typography variant="body2">
                Jede angemeldete Person sieht:
            </Typography>

            <Liste eintraege={OHNE_ROLLE} />

            <Typography
                variant="caption"
                sx={{
                    display: "block",
                    mt: 1,
                    opacity: 0.85,
                }}
            >
                Mehrere Rollen lassen sich kombinieren – man sieht dann alles zusammen.
            </Typography>
        </Hilfe>
    );
}
