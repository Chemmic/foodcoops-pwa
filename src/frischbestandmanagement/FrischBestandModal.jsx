import React from "react";

import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";


export function FrischBestandModal(props) {
    const {
        show,
        hide,
        title,
        body,
        footer,
        parentProps,
    } = props;

    return (
        <Dialog
            open={Boolean(show)}
            onClose={hide}
            fullWidth
            maxWidth="md"
            scroll="paper"
            aria-labelledby="frischbestand-modal-title"
        >
            <DialogTitle
                id="frischbestand-modal-title"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    pr: 1,
                }}
            >
                {title}

                <IconButton
                    aria-label="Dialog schließen"
                    onClick={hide}
                    edge="end"
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent
                dividers
                sx={{
                    overflowY: "auto",
                }}
            >
                {body}

                {parentProps?.children}
            </DialogContent>

            {footer && (
                <DialogActions
                    sx={{
                        px: {
                            xs: 2,
                            sm: 3,
                        },
                        py: 2,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,

                        "& > :not(style) ~ :not(style)": {
                            ml: 0,
                        },
                    }}
                >
                    {footer}
                </DialogActions>
            )}
        </Dialog>
    );
}