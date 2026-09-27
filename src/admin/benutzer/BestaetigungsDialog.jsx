import React from "react";

import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";


/**
 * Einfache Sicherheitsabfrage, z.B. vor dem Löschen.
 */
export function BestaetigungsDialog({
    open,
    title,
    children,
    confirmLabel = "Bestätigen",
    confirmColor = "error",
    busy = false,
    onConfirm,
    onClose,
}) {
    return (
        <Dialog
            open={open}
            onClose={
                busy
                    ? undefined
                    : onClose
            }
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle>
                {title}
            </DialogTitle>

            <DialogContent>
                <DialogContentText
                    component="div"
                >
                    {children}
                </DialogContentText>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={onClose}
                    disabled={busy}
                >
                    Abbrechen
                </Button>

                <Button
                    variant="contained"
                    color={confirmColor}
                    onClick={onConfirm}
                    disabled={busy}
                    startIcon={
                        busy
                            ? (
                                <CircularProgress
                                    size={16}
                                    color="inherit"
                                />
                            )
                            : null
                    }
                >
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
