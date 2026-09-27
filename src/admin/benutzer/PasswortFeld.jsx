import React, {
    useState,
} from "react";

import {
    IconButton,
    InputAdornment,
    TextField,
    Tooltip,
} from "@mui/material";

import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import { toast } from "react-toastify";

import {
    copyToClipboard,
    generatePassword,
} from "./passwort.js";


/**
 * Passwortfeld mit Anzeigen, Generieren und Kopieren.
 */
export function PasswortFeld({
    value,
    onChange,
    label = "Passwort",
    helperText,
    autoFocus = false,
}) {
    const [
        visible,
        setVisible,
    ] = useState(false);


    const generate = () => {
        onChange(
            generatePassword()
        );

        setVisible(true);
    };


    const copy = async () => {
        const copied =
            await copyToClipboard(
                value
            );

        if (copied) {
            toast.info(
                "Passwort kopiert."
            );
        } else {
            toast.warning(
                "Kopieren nicht möglich – bitte manuell markieren."
            );
        }
    };


    return (
        <TextField
            fullWidth
            label={label}
            value={value}
            autoFocus={autoFocus}
            autoComplete="new-password"
            type={
                visible
                    ? "text"
                    : "password"
            }
            onChange={event =>
                onChange(
                    event.target.value
                )
            }
            helperText={helperText}
            slotProps={{
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                            <Tooltip title={visible ? "Verbergen" : "Anzeigen"}>
                                <IconButton
                                    size="small"
                                    onClick={() =>
                                        setVisible(
                                            current =>
                                                !current
                                        )
                                    }
                                    aria-label={
                                        visible
                                            ? "Passwort verbergen"
                                            : "Passwort anzeigen"
                                    }
                                >
                                    {visible
                                        ? <VisibilityOffOutlinedIcon fontSize="small" />
                                        : <VisibilityOutlinedIcon fontSize="small" />}
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Sicheres Passwort erzeugen">
                                <IconButton
                                    size="small"
                                    onClick={generate}
                                    aria-label="Passwort erzeugen"
                                >
                                    <AutorenewOutlinedIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Kopieren">
                                <span>
                                    <IconButton
                                        size="small"
                                        onClick={copy}
                                        disabled={!value}
                                        aria-label="Passwort kopieren"
                                    >
                                        <ContentCopyOutlinedIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </InputAdornment>
                    ),
                },
            }}
        />
    );
}
