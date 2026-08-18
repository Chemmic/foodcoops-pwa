import React from "react";

import {
    Button,
    MenuItem,
    Stack,
    TextField,
} from "@mui/material";

import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CloseIcon from "@mui/icons-material/Close";

import { DeadlineModal } from "./DeadlineModal.jsx";


const WEEKDAYS = [
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
    "Samstag",
    "Sonntag",
];


export function NewDeadlineModal(
    props
) {
    const [weekday, setWeekday] =
        React.useState("Montag");

    const [time, setTime] =
        React.useState("23:59");


    // =========================================================================
    // Dialog bei Öffnen immer mit Defaults starten
    // =========================================================================

    React.useEffect(() => {
        if (props.show) {
            setWeekday("Montag");
            setTime("23:59");
        }
    }, [props.show]);


    const close = () => {
        setWeekday("Montag");
        setTime("23:59");

        props.close();
    };


    const save = () => {
        props.create({
            weekday,
            time,
        });
    };


    const body = (
        <Stack spacing={2.5}>
            <TextField
                select
                fullWidth
                label="Wochentag"
                value={weekday}
                onChange={event =>
                    setWeekday(
                        event.target.value
                    )
                }
            >
                {WEEKDAYS.map(
                    day => (
                        <MenuItem
                            key={day}
                            value={day}
                        >
                            {day}
                        </MenuItem>
                    )
                )}
            </TextField>


            <TextField
                fullWidth
                label="Uhrzeit"
                type="time"
                value={time}
                onChange={event =>
                    setTime(
                        event.target.value
                    )
                }
                slotProps={{
                    inputLabel: {
                        shrink: true,
                    },

                    htmlInput: {
                        step: 60,
                    },
                }}
            />
        </Stack>
    );


    const footer = (
        <>
            <Button
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={close}
            >
                Verwerfen
            </Button>

            <Button
                variant="contained"
                startIcon={
                    <AccessTimeOutlinedIcon />
                }
                onClick={save}
                disabled={
                    !weekday ||
                    !time
                }
            >
                Deadline erstellen
            </Button>
        </>
    );


    return (
        <DeadlineModal
            title="Deadline erstellen"
            body={body}
            footer={footer}
            show={props.show}
            hide={close}
            parentProps={props}
        />
    );
}