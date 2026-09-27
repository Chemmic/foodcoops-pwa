import React from "react";

import { TextField } from "@mui/material";


/**
 * "Platz in der Liste" beim Anlegen eines Produkts (1 = oben, leer = ans
 * Ende). anzahl: wie viele Produkte es schon gibt.
 */
export function PlatzFeld({
    value,
    onChange,
    anzahl = 0,
    hinweis = "1 = ganz oben",
}) {
    return (
        <TextField
            fullWidth
            label="Platz in der Liste"
            type="number"
            value={value}
            onChange={event =>
                onChange(event.target.value)
            }
            slotProps={{
                htmlInput: {
                    min: 1,
                    max: anzahl + 1,
                },
            }}
            helperText={`${hinweis}. Leer lassen = ans Ende (Platz ${anzahl + 1}).`}
        />
    );
}


/** Eingabe -> Wert für das Backend (null = ans Ende). */
export const platzAusEingabe = eingabe => {
    const zahl =
        Number(eingabe);

    return eingabe !== "" && zahl >= 1
        ? Math.round(zahl)
        : null;
};
