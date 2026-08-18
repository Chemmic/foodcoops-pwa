import React from "react";

import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";


export function DeadlineModal(props) {
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
            maxWidth="sm"
            aria-labelledby="deadline-modal-title"
        >
            <DialogTitle
                id="deadline-modal-title"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                        "space-between",

                    gap: 2,
                    pr: 1,
                }}
            >
                {title}

                <IconButton
                    edge="end"
                    aria-label="Dialog schließen"
                    onClick={hide}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>


            <DialogContent
                dividers
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

                        gap: 1,

                        flexWrap:
                            "wrap",

                        "& > :not(style) ~ :not(style)":
                            {
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