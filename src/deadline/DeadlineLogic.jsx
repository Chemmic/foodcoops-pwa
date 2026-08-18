import React, {
    useEffect,
    useState,
} from "react";

import {
    Alert,
    Box,
    CircularProgress,
    Stack,
    Typography,
} from "@mui/material";

import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

import { useApi } from "../ApiService.jsx";


export function DeadlineLogic() {
    const api = useApi();

    const [
        isLoadingDeadline,
        setIsLoadingDeadline,
    ] = useState(true);

    const [
        deadline,
        setDeadline,
    ] = useState(null);


    // =========================================================================
    // Deadline laden
    // =========================================================================

    useEffect(() => {
        let active = true;


        const fetchDeadline =
            async () => {
                setIsLoadingDeadline(
                    true
                );

                try {
                    const lastResponse =
                        await api.readLastDeadline();


                    if (
                        !lastResponse.ok
                    ) {
                        return;
                    }


                    const lastDeadline =
                        await lastResponse.json();


                    if (
                        !lastDeadline?.id ||
                        !active
                    ) {
                        return;
                    }


                    const currentResponse =
                        await api.readCurrentDeadline(
                            lastDeadline.id
                        );


                    if (
                        !currentResponse.ok
                    ) {
                        return;
                    }


                    const currentDeadline =
                        await currentResponse.json();


                    if (active) {
                        setDeadline(
                            currentDeadline
                        );
                    }
                } catch (error) {
                    console.error(
                        "Fehler beim Laden der Deadline:",
                        error
                    );
                } finally {
                    if (active) {
                        setIsLoadingDeadline(
                            false
                        );
                    }
                }
            };


        fetchDeadline();


        return () => {
            active = false;
        };
    }, [api]);


    // =========================================================================
    // Loading
    // =========================================================================

    if (isLoadingDeadline) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent:
                        "center",
                    alignItems:
                        "center",

                    py: 3,
                }}
            >
                <CircularProgress
                    size={28}
                />
            </Box>
        );
    }


    // =========================================================================
    // Keine Deadline
    // =========================================================================

    if (!deadline) {
        return null;
    }


    // =========================================================================
    // Datum formatieren
    // =========================================================================

    const date =
        new Date(deadline);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        console.warn(
            "Ungültiges Deadline-Datum:",
            deadline
        );

        return null;
    }


    const formattedDate =
        new Intl.DateTimeFormat(
            "de-DE",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }
        ).format(date);


    const formattedTime =
        new Intl.DateTimeFormat(
            "de-DE",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        ).format(date);


    // =========================================================================
    // Render
    // =========================================================================

    return (
        <Alert
            severity="warning"
            icon={
                <AccessTimeOutlinedIcon />
            }
            sx={{
                my: 1.5,

                "& .MuiAlert-message":
                    {
                        width: "100%",
                    },
            }}
        >
            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                spacing={{
                    xs: 0.5,
                    sm: 1,
                }}
                alignItems={{
                    xs: "flex-start",
                    sm: "center",
                }}
            >
                <Typography
                    component="span"
                    fontWeight={700}
                >
                    Bestell-Deadline:
                </Typography>

                <Typography
                    component="span"
                    fontWeight={600}
                >
                    {formattedDate},{" "}
                    {formattedTime} Uhr
                </Typography>
            </Stack>
        </Alert>
    );
}