import React from "react";

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Button,
    Stack,
    Typography,
} from "@mui/material";

import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { toast } from "react-toastify";

import { useApi } from "../ApiService.jsx";
import { useAuth } from "../auth/AuthContext.jsx";


function downloadBase64Pdf(json) {
    if (
        !json?.pdf ||
        !json?.filename
    ) {
        throw new Error(
            "Ungültige PDF-Antwort"
        );
    }


    const binaryString =
        window.atob(json.pdf);

    const bytes =
        new Uint8Array(
            binaryString.length
        );


    for (
        let index = 0;
        index <
        binaryString.length;
        index++
    ) {
        bytes[index] =
            binaryString.charCodeAt(
                index
            );
    }


    const blob =
        new Blob(
            [bytes],
            {
                type:
                    "application/pdf",
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download =
        `${json.filename}.pdf`;


    document.body.appendChild(
        link
    );

    link.click();
    link.remove();


    URL.revokeObjectURL(
        url
    );
}


export function PdfUebersicht() {
    const api = useApi();

    const {
        email,
    } = useAuth();


    // =========================================================================
    // Download
    // =========================================================================

    const downloadPdf =
        async (
            request,
            description
        ) => {
            try {
                const response =
                    await request();

                if (!response.ok) {
                    throw new Error(
                        `HTTP ${response.status}`
                    );
                }

                const json =
                    await response.json();

                downloadBase64Pdf(
                    json
                );
            } catch (error) {
                console.error(
                    `Fehler beim Download ${description}:`,
                    error
                );

                toast.error(
                    "Das PDF konnte nicht heruntergeladen werden."
                );
            }
        };


    // =========================================================================
    // E-Mail
    // =========================================================================

    const sendEmail =
        async (
            request,
            description
        ) => {
            if (!email) {
                toast.error(
                    "Für deinen Benutzer ist keine E-Mail-Adresse hinterlegt."
                );

                return;
            }


            try {
                const response =
                    await request(
                        email
                    );


                if (response.ok) {
                    toast.success(
                        "Die E-Mail wurde erfolgreich versendet."
                    );

                    return;
                }


                toast.error(
                    "Die E-Mail konnte nicht versendet werden."
                );
            } catch (error) {
                console.error(
                    `Fehler beim Versand ${description}:`,
                    error
                );

                toast.error(
                    "Beim Versenden der E-Mail ist ein Fehler aufgetreten."
                );
            }
        };


    return (
        <Stack spacing={1.5}>
            <Accordion
                defaultExpanded
                disableGutters
            >
                <AccordionSummary
                    expandIcon={
                        <ExpandMoreIcon />
                    }
                >
                    <Typography
                        variant="h6"
                    >
                        Alle aktuellen
                        Frischbestellungen
                    </Typography>
                </AccordionSummary>

                <AccordionDetails>
                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        spacing={1}
                    >
                        <Button
                            variant="outlined"
                            startIcon={
                                <DownloadOutlinedIcon />
                            }
                            onClick={() =>
                                downloadPdf(
                                    api.getUebersichtFrischByte,
                                    "Frischbestellungen"
                                )
                            }
                        >
                            PDF herunterladen
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={
                                <EmailOutlinedIcon />
                            }
                            onClick={() =>
                                sendEmail(
                                    api.sendFrischOrder,
                                    "Frischbestellungen"
                                )
                            }
                        >
                            An mich senden
                        </Button>
                    </Stack>
                </AccordionDetails>
            </Accordion>


            <Accordion
                defaultExpanded
                disableGutters
            >
                <AccordionSummary
                    expandIcon={
                        <ExpandMoreIcon />
                    }
                >
                    <Typography
                        variant="h6"
                    >
                        Brotbestellungen für
                        den Fasanenbäcker
                    </Typography>
                </AccordionSummary>

                <AccordionDetails>
                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        spacing={1}
                    >
                        <Button
                            variant="outlined"
                            startIcon={
                                <DownloadOutlinedIcon />
                            }
                            onClick={() =>
                                downloadPdf(
                                    api.getUebersichtBrotByte,
                                    "Brotbestellungen"
                                )
                            }
                        >
                            PDF herunterladen
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={
                                <EmailOutlinedIcon />
                            }
                            onClick={() =>
                                sendEmail(
                                    api.sendBrotOrder,
                                    "Brotbestellungen"
                                )
                            }
                        >
                            An mich senden
                        </Button>
                    </Stack>
                </AccordionDetails>
            </Accordion>


            <Accordion
                defaultExpanded
                disableGutters
            >
                <AccordionSummary
                    expandIcon={
                        <ExpandMoreIcon />
                    }
                >
                    <Typography
                        variant="h6"
                    >
                        Brotbestellungen zum
                        Aushängen in der
                        FoodCoop
                    </Typography>
                </AccordionSummary>

                <AccordionDetails>
                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        spacing={1}
                    >
                        <Button
                            variant="outlined"
                            startIcon={
                                <DownloadOutlinedIcon />
                            }
                            onClick={() =>
                                downloadPdf(
                                    api.getBreadWithPersonPDFasByte,
                                    "Brotbestellungen mit Personen"
                                )
                            }
                        >
                            PDF herunterladen
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={
                                <EmailOutlinedIcon />
                            }
                            onClick={() =>
                                sendEmail(
                                    api.sendBreadOrderWithPersons,
                                    "Brotbestellungen mit Personen"
                                )
                            }
                        >
                            An mich senden
                        </Button>
                    </Stack>
                </AccordionDetails>
            </Accordion>


            {!email && (
                <Alert severity="warning">
                    Für deinen
                    Keycloak-Benutzer ist
                    keine E-Mail-Adresse
                    hinterlegt. Der
                    PDF-Download funktioniert
                    trotzdem.
                </Alert>
            )}
        </Stack>
    );
}