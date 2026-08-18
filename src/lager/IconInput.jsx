import React from "react";

import {
    Alert,
    Box,
    Button,
    Stack,
    Typography,
} from "@mui/material";

import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";


function isValidImage(result) {
    return (
        typeof result ===
            "string" &&
        result.startsWith(
            "data:image"
        )
    );
}


export function IconInput({
    setIcon,
}) {
    const [
        fileName,
        setFileName,
    ] = React.useState("");

    const [
        error,
        setError,
    ] = React.useState("");


    const handleFileChange =
        event => {
            const file =
                event.target.files?.[0];

            if (!file) {
                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {
                setError(
                    "Bitte wähle eine Bilddatei aus."
                );

                event.target.value =
                    "";

                return;
            }


            const fileReader =
                new FileReader();


            fileReader.onerror = () => {
                setError(
                    "Die Datei konnte nicht gelesen werden."
                );
            };


            fileReader.onload = () => {
                const result =
                    fileReader.result;

                if (
                    !isValidImage(
                        result
                    )
                ) {
                    setError(
                        "Das Dateiformat wurde nicht als Bild erkannt."
                    );

                    return;
                }

                setError("");
                setFileName(
                    file.name
                );

                setIcon(result);
            };


            fileReader.readAsDataURL(
                file
            );
        };


    return (
        <Stack spacing={1.5}>
            <Button
                component="label"
                variant="outlined"
                startIcon={
                    <UploadFileOutlinedIcon />
                }
            >
                Icon auswählen

                <Box
                    component="input"
                    type="file"
                    accept="image/*"
                    onChange={
                        handleFileChange
                    }
                    sx={{
                        display: "none",
                    }}
                />
            </Button>

            {fileName && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Ausgewählt:{" "}
                    {fileName}
                </Typography>
            )}

            {error && (
                <Alert severity="error">
                    {error}
                </Alert>
            )}
        </Stack>
    );
}