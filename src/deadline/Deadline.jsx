import React from "react";

import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import AddAlarmOutlinedIcon from "@mui/icons-material/AddAlarmOutlined";

import { toast } from "react-toastify";

import { useApi } from "../ApiService.jsx";
import { DeadlineTable } from "./DeadlineTable.jsx";
import { NewDeadlineModal } from "./NewDeadlineModal.jsx";


export function Deadline() {
    const columns = React.useMemo(
        () => [
            {
                header: "Wochentag",
                accessorKey: "weekday",
            },
            {
                header: "Uhrzeit",
                accessorKey: "time",
            },
        ],
        []
    );


    const [data, setData] =
        React.useState([]);

    const [isLoading, setIsLoading] =
        React.useState(true);

    const [modalOpen, setModalOpen] =
        React.useState(false);

    const [
        refreshCounter,
        refresh,
    ] = React.useReducer(
        value => value + 1,
        0
    );


    const api = useApi();


    // =========================================================================
    // Deadline laden
    // =========================================================================

    React.useEffect(() => {
        let active = true;


        const loadDeadline = async () => {
            setIsLoading(true);

            try {
                const response =
                    await api.readLastDeadline();


                if (!response.ok) {
                    throw new Error(
                        `Deadline konnte nicht geladen werden: ${response.status}`
                    );
                }


                const result =
                    await response.json();


                if (!active) {
                    return;
                }


                if (!result?.id) {
                    setData([]);
                    return;
                }


                setData([
                    {
                        id: result.id,
                        weekday:
                            result.weekday,
                        time:
                            result.time,
                    },
                ]);
            } catch (error) {
                console.error(
                    "Fehler beim Laden der Deadline:",
                    error
                );

                if (active) {
                    setData([]);

                    toast.error(
                        "Die aktuelle Deadline konnte nicht geladen werden."
                    );
                }
            } finally {
                if (active) {
                    setIsLoading(
                        false
                    );
                }
            }
        };


        loadDeadline();


        return () => {
            active = false;
        };
    }, [
        api,
        refreshCounter,
    ]);


    // =========================================================================
    // Neue Deadline
    // =========================================================================

    const newDeadline =
        async deadlineData => {
            const time =
                deadlineData.time?.length ===
                5
                    ? `${deadlineData.time}:00`
                    : deadlineData.time;


            const dataToCreate = {
                ...deadlineData,

                time,

                datum:
                    new Date(),
            };


            try {
                const response =
                    await api.createDeadline(
                        dataToCreate
                    );


                if (!response.ok) {
                    toast.error(
                        "Fehler beim Erstellen der Deadline. Bitte versuche es erneut."
                    );

                    return;
                }


                toast.success(
                    "Die neue Deadline wurde erfolgreich erstellt."
                );


                setModalOpen(false);

                refresh();
            } catch (error) {
                console.error(
                    "Fehler beim Erstellen der Deadline:",
                    error
                );

                toast.error(
                    "Beim Erstellen der Deadline ist ein Fehler aufgetreten."
                );
            }
        };


    // =========================================================================
    // Render
    // =========================================================================

    return (
        <Stack spacing={3}>
            <Box>
                <Typography
                    variant="h2"
                    gutterBottom
                >
                    Bestell-Deadline
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                >
                    Lege fest, an welchem
                    Wochentag und zu welcher
                    Uhrzeit die Bestellfrist
                    endet.
                </Typography>
            </Box>


            <Paper
                elevation={0}
                sx={{
                    p: {
                        xs: 1.5,
                        sm: 2,
                    },

                    border: 1,
                    borderColor:
                        "divider",
                }}
            >
                <Button
                    variant="contained"
                    startIcon={
                        <AddAlarmOutlinedIcon />
                    }
                    onClick={() =>
                        setModalOpen(true)
                    }
                >
                    Neue Deadline
                </Button>
            </Paper>


            {isLoading ? (
                <Box
                    sx={{
                        minHeight: 220,

                        display: "flex",
                        flexDirection:
                            "column",

                        justifyContent:
                            "center",
                        alignItems:
                            "center",

                        gap: 2,
                    }}
                >
                    <CircularProgress />

                    <Typography
                        color="text.secondary"
                    >
                        Deadline wird
                        geladen …
                    </Typography>
                </Box>
            ) : (
                <DeadlineTable
                    columns={columns}
                    data={data}
                />
            )}


            <NewDeadlineModal
                show={modalOpen}
                close={() =>
                    setModalOpen(false)
                }
                create={newDeadline}
                columns={columns}
            />
        </Stack>
    );
}