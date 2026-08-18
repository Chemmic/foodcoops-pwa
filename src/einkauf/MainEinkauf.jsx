import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ShoppingCartCheckoutOutlinedIcon from "@mui/icons-material/ShoppingCartCheckoutOutlined";

import { toast } from "react-toastify";

import { BrotEinkauf } from "./BrotEinkauf.jsx";
import { FrischEinkauf } from "./FrischEinkauf.jsx";
import { LagerwareEinkauf } from "./LagerwareEinkauf.jsx";
import { ZuVielZuWenigEinkauf } from "./ZuVielZuWenigEinkauf.jsx";

import { useApi } from "../ApiService.jsx";

import {
    getUsersOfRole,
} from "../auth/Keycloak";

import NumberFormatComponent from "../logic/NumberFormatComponent.jsx";

import { useAuth } from "../auth/AuthContext.jsx";


const getItemKey = (
    item,
    index,
    prefix
) =>
    item?.id ??
    `${prefix}-${index}`;


function PriceRow({
    label,
    value,
}) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns:
                    "minmax(0, 1fr) 110px",
                columnGap: 3,
                alignItems: "baseline",
            }}
        >
            <Typography
                color="text.secondary"
                sx={{
                    minWidth: 0,
                }}
            >
                {label}
            </Typography>

            <Typography
                fontWeight={600}
                sx={{
                    width: "110px",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                    fontVariantNumeric:
                        "tabular-nums",
                }}
            >
                <NumberFormatComponent
                    value={Number(
                        value
                    ).toFixed(2)}
                />{" "}
                €
            </Typography>
        </Box>
    );
}


export function MainEinkauf() {
    const api = useApi();

    const { keycloak } =
        useAuth();


    // =========================================================================
    // Daten der einzelnen Bereiche
    // =========================================================================

    const [frisch, setFrisch] =
        useState([]);

    const [brot, setBrot] =
        useState([]);

    const [produkt, setProdukt] =
        useState([]);

    const [
        discrepancy,
        setDiscrepancy,
    ] = useState([]);


    // =========================================================================
    // Eingabemengen
    // =========================================================================

    const [
        frischAmounts,
        setFrischAmounts,
    ] = useState({});

    const [
        brotAmounts,
        setBrotAmounts,
    ] = useState({});

    const [
        produktAmounts,
        setProduktAmounts,
    ] = useState({});

    const [
        discrepancyAmounts,
        setDiscrepancyAmounts,
    ] = useState({});


    // =========================================================================
    // Preise
    // =========================================================================

    const [
        totalFrischPrice,
        setTotalFrischPrice,
    ] = useState(0);

    const [
        totalBrotPrice,
        setTotalBrotPrice,
    ] = useState(0);

    const [
        totalProduktPrice,
        setTotalProduktPrice,
    ] = useState(0);

    const [
        totalDiscrepancyPrice,
        setTotalDiscrepancyPrice,
    ] = useState(0);


    const [
        deliveryCostPercentage,
        setDeliveryCostPercentage,
    ] = useState(0);


    const [
        refreshKey,
        refresh,
    ] = React.useReducer(
        value => value + 1,
        0
    );

    const [
        resetKey,
        resetInputs,
    ] = React.useReducer(
        value => value + 1,
        0
    );


    const [
        submitting,
        setSubmitting,
    ] = useState(false);


    // =========================================================================
    // Konfiguration
    // =========================================================================

    useEffect(() => {
        let active = true;

        const fetchConfigData =
            async () => {
                try {
                    const response =
                        await api.readConfig();

                    if (!response.ok) {
                        return;
                    }

                    const data =
                        await response.json();

                    if (
                        active &&
                        data !== null
                    ) {
                        setDeliveryCostPercentage(
                            Number(
                                data.deliverycost ??
                                    0
                            )
                        );
                    }
                } catch (error) {
                    console.error(
                        "Error fetching config data:",
                        error
                    );
                }
            };

        fetchConfigData();

        return () => {
            active = false;
        };
    }, [api]);


    // =========================================================================
    // Summen
    // =========================================================================

    const deliveryCost =
        useMemo(
            () =>
                (
                    totalFrischPrice +
                    totalDiscrepancyPrice
                ) *
                (
                    deliveryCostPercentage /
                    100
                ),
            [
                totalFrischPrice,
                totalDiscrepancyPrice,
                deliveryCostPercentage,
            ]
        );


    const totalPrice =
        useMemo(
            () =>
                totalFrischPrice +
                totalBrotPrice +
                totalProduktPrice +
                totalDiscrepancyPrice +
                deliveryCost,
            [
                totalFrischPrice,
                totalBrotPrice,
                totalProduktPrice,
                totalDiscrepancyPrice,
                deliveryCost,
            ]
        );


    // =========================================================================
    // Reset
    // =========================================================================

    const clearInputFields =
        () => {
            setFrischAmounts({});
            setBrotAmounts({});
            setProduktAmounts({});
            setDiscrepancyAmounts(
                {}
            );

            setTotalFrischPrice(0);
            setTotalBrotPrice(0);
            setTotalProduktPrice(0);
            setTotalDiscrepancyPrice(
                0
            );

            resetInputs();
        };


    // =========================================================================
    // Einkauf übermitteln
    // =========================================================================

    const submitEinkauf =
        async () => {
            const personId =
                keycloak
                    ?.tokenParsed
                    ?.preferred_username;

            const email =
                keycloak
                    ?.tokenParsed
                    ?.email;


            if (!personId) {
                toast.error(
                    "Der angemeldete Benutzer konnte nicht ermittelt werden."
                );

                return;
            }


            setSubmitting(true);


            try {
                // =============================================================
                // Lagerware
                // =============================================================

                const bestandBuyObjects =
                    [];


                for (
                    let index = 0;
                    index <
                    produkt.length;
                    index++
                ) {
                    const item =
                        produkt[index];

                    const key =
                        getItemKey(
                            item,
                            index,
                            "lager"
                        );

                    const amount =
                        Number(
                            produktAmounts[
                                key
                            ] ?? 0
                        );

                    if (amount <= 0) {
                        continue;
                    }


                    const newBestandBuyObject =
                        {
                            amount,

                            bestandEntity: {
                                ...item,
                                type: "lager",
                            },
                        };


                    const response =
                        await api.createBestandBuyObject(
                            newBestandBuyObject
                        );


                    if (!response.ok) {
                        throw new Error(
                            `Lagerware ${item.name} konnte nicht vorbereitet werden.`
                        );
                    }


                    const created =
                        await response.json();

                    bestandBuyObjects.push(
                        created
                    );
                }


                // =============================================================
                // Brot
                // =============================================================

                const bestellungsEinkaufe =
                    [];


                for (
                    let index = 0;
                    index <
                    brot.length;
                    index++
                ) {
                    const item =
                        brot[index];

                    const key =
                        getItemKey(
                            item,
                            index,
                            "brot"
                        );

                    const amount =
                        Number(
                            brotAmounts[
                                key
                            ] ?? 0
                        );

                    if (amount <= 0) {
                        continue;
                    }


                    bestellungsEinkaufe.push(
                        {
                            amount,

                            bestellung: {
                                ...item,

                                type: "brot",

                                brotbestand: {
                                    ...item.brotbestand,
                                    type: "brot",
                                },
                            },
                        }
                    );
                }


                // =============================================================
                // Frisch
                // =============================================================

                for (
                    let index = 0;
                    index <
                    frisch.length;
                    index++
                ) {
                    const item =
                        frisch[index];

                    const key =
                        getItemKey(
                            item,
                            index,
                            "frisch"
                        );

                    const amount =
                        Number(
                            frischAmounts[
                                key
                            ] ?? 0
                        );

                    if (amount <= 0) {
                        continue;
                    }


                    bestellungsEinkaufe.push(
                        {
                            amount,

                            bestellung: {
                                ...item,

                                type:
                                    "frisch",

                                frischbestand:
                                    {
                                        ...item.frischbestand,

                                        type:
                                            "frisch",
                                    },
                            },
                        }
                    );
                }


                // =============================================================
                // Zu viel / zu wenig
                // =============================================================

                const discrepancyEinkaufe =
                    [];


                for (
                    let index = 0;
                    index <
                    discrepancy.length;
                    index++
                ) {
                    const item =
                        discrepancy[index];

                    const key =
                        getItemKey(
                            item,
                            index,
                            "discrepancy"
                        );

                    const amount =
                        Number(
                            discrepancyAmounts[
                                key
                            ] ?? 0
                        );

                    if (amount <= 0) {
                        continue;
                    }


                    discrepancyEinkaufe.push(
                        {
                            amount,
                            discrepancy:
                                item,
                        }
                    );
                }


                // =============================================================
                // Einkauf anlegen
                // =============================================================

                const einkaufData = {
                    bestandEinkauf:
                        bestandBuyObjects,

                    bestellungsEinkauf:
                        bestellungsEinkaufe,

                    tooMuchEinkauf:
                        discrepancyEinkaufe,

                    personId,
                };


                const response =
                    await api.createEinkauf(
                        einkaufData
                    );


                if (!response.ok) {
                    toast.error(
                        "Fehler beim Übermitteln des Einkaufs. Bitte versuche es erneut."
                    );

                    return;
                }


                const responseData =
                    await response.json();


                clearInputFields();
                refresh();


                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });


                toast.success(
                    "Der Einkauf wurde erfolgreich übermittelt. Vielen Dank!"
                );


                // =============================================================
                // Bestätigungsmail Benutzer
                // =============================================================

                const emailResponse =
                    await api.createEinkaufPdf(
                        responseData.id,
                        email
                    );


                // =============================================================
                // Einkaufsmanagement informieren
                // =============================================================

                let users = [];

                try {
                    users =
                        (
                            await getUsersOfRole(
                                "Einkaufsmanagement"
                            )
                        ) ?? [];
                } catch (error) {
                    console.error(
                        "Einkaufsmanagement konnte nicht geladen werden:",
                        error
                    );
                }


                const recipients =
                    users
                        .filter(
                            user =>
                                Boolean(
                                    user.email
                                )
                        )
                        .map(user => ({
                            email:
                                user.email,

                            username:
                                user.username,
                        }));


                let managementMailOk =
                    true;


                if (
                    recipients.length >
                    0
                ) {
                    const mailResponse =
                        await api.sendMailToEinkaufsmanagement(
                            responseData.id,
                            recipients
                        );

                    managementMailOk =
                        mailResponse.ok;
                }


                if (
                    !emailResponse.ok ||
                    !managementMailOk
                ) {
                    toast.info(
                        "Der Einkauf wurde gespeichert, aber mindestens eine Bestätigungs-E-Mail konnte nicht versendet werden."
                    );
                }
            } catch (error) {
                console.error(
                    "Fehler beim Übermitteln des Einkaufs:",
                    error
                );

                toast.error(
                    "Beim Übermitteln des Einkaufs ist ein Fehler aufgetreten. Bitte versuche es erneut."
                );
            } finally {
                setSubmitting(false);
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
                    Einkauf erfassen
                </Typography>

                <Typography
                    color="text.secondary"
                >
                    Trage die tatsächlich
                    gekauften Mengen ein und
                    bestätige den Einkauf
                    anschließend gemeinsam.
                </Typography>
            </Box>


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
                            Frischwaren
                        </Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        <Stack spacing={2}>
                            <FrischEinkauf
                                forceUpdate={
                                    refreshKey
                                }
                                resetKey={
                                    resetKey
                                }
                                onPriceChange={
                                    setTotalFrischPrice
                                }
                                handleFrisch={
                                    setFrisch
                                }
                                onAmountsChange={
                                    setFrischAmounts
                                }
                            />

                            {frisch.length ===
                            0 ? (
                                <Alert severity="info">
                                    Du hast für
                                    diesen Einkauf
                                    keine
                                    Frischbestellung.
                                </Alert>
                            ) : (
                                <Typography
                                    fontWeight={
                                        700
                                    }
                                >
                                    Frischwaren:{" "}
                                    <NumberFormatComponent
                                        value={totalFrischPrice.toFixed(
                                            2
                                        )}
                                    />{" "}
                                    €
                                </Typography>
                            )}
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
                            Zu viel /
                            Restmengen
                        </Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        <Stack spacing={2}>
                            <ZuVielZuWenigEinkauf
                                forceUpdate={
                                    refreshKey
                                }
                                resetKey={
                                    resetKey
                                }
                                onPriceChange={
                                    setTotalDiscrepancyPrice
                                }
                                handleDiscrepancy={
                                    setDiscrepancy
                                }
                                onAmountsChange={
                                    setDiscrepancyAmounts
                                }
                            />

                            {discrepancy.length ===
                                0 ||
                            !discrepancy.some(
                                item =>
                                    Number(
                                        item.zuVielzuWenig
                                    ) > 0
                            ) ? (
                                <Alert severity="info">
                                    Diese Woche
                                    gibt es keine
                                    Produkte auf
                                    der Zu-viel-Liste.
                                </Alert>
                            ) : (
                                <Typography
                                    fontWeight={
                                        700
                                    }
                                >
                                    Restmengen:{" "}
                                    <NumberFormatComponent
                                        value={totalDiscrepancyPrice.toFixed(
                                            2
                                        )}
                                    />{" "}
                                    €
                                </Typography>
                            )}
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
                            Brot
                        </Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        <Stack spacing={2}>
                            <BrotEinkauf
                                forceUpdate={
                                    refreshKey
                                }
                                resetKey={
                                    resetKey
                                }
                                onPriceChange={
                                    setTotalBrotPrice
                                }
                                handleBrot={
                                    setBrot
                                }
                                onAmountsChange={
                                    setBrotAmounts
                                }
                            />

                            {brot.length ===
                            0 ? (
                                <Alert severity="info">
                                    Du hast für
                                    diesen Einkauf
                                    keine
                                    Brotbestellung.
                                </Alert>
                            ) : (
                                <Typography
                                    fontWeight={
                                        700
                                    }
                                >
                                    Brot:{" "}
                                    <NumberFormatComponent
                                        value={totalBrotPrice.toFixed(
                                            2
                                        )}
                                    />{" "}
                                    €
                                </Typography>
                            )}
                        </Stack>
                    </AccordionDetails>
                </Accordion>


                <Accordion
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
                            Lagerware
                        </Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        <Stack spacing={2}>
                            <LagerwareEinkauf
                                forceUpdate={
                                    refreshKey
                                }
                                resetKey={
                                    resetKey
                                }
                                onPriceChange={
                                    setTotalProduktPrice
                                }
                                handleProdukt={
                                    setProdukt
                                }
                                onAmountsChange={
                                    setProduktAmounts
                                }
                            />

                            {produkt.length ===
                            0 ? (
                                <Alert severity="info">
                                    Im Lager
                                    befinden sich
                                    aktuell keine
                                    Produkte.
                                </Alert>
                            ) : (
                                <Typography
                                    fontWeight={
                                        700
                                    }
                                >
                                    Lagerware:{" "}
                                    <NumberFormatComponent
                                        value={totalProduktPrice.toFixed(
                                            2
                                        )}
                                    />{" "}
                                    €
                                </Typography>
                            )}
                        </Stack>
                    </AccordionDetails>
                </Accordion>
            </Stack>


            {/* ============================================================= */}
            {/* Zusammenfassung                                                */}
            {/* ============================================================= */}

            <Paper
                elevation={0}
                sx={{
                    width: "100%",
                    maxWidth: 560,
                    ml: "auto",

                    p: {
                        xs: 2,
                        sm: 3,
                    },

                    border: 1,
                    borderColor:
                        "divider",
                }}
            >
                <Stack spacing={1.25}>
                    <Typography
                        variant="h5"
                        gutterBottom
                    >
                        Zusammenfassung
                    </Typography>

                    <PriceRow
                        label="Frischwaren"
                        value={
                            totalFrischPrice
                        }
                    />

                    <PriceRow
                        label="Zu viel / Restmengen"
                        value={
                            totalDiscrepancyPrice
                        }
                    />

                    <PriceRow
                        label="Brot"
                        value={
                            totalBrotPrice
                        }
                    />

                    <PriceRow
                        label="Lagerware"
                        value={
                            totalProduktPrice
                        }
                    />

                    <PriceRow
                        label={`${deliveryCostPercentage} % Lieferkosten`}
                        value={
                            deliveryCost
                        }
                    />

                    <Divider
                        sx={{
                            my: 1,
                        }}
                    />

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns:
                                "minmax(0, 1fr) 110px",
                            columnGap: 3,
                            alignItems: "baseline",
                        }}
                    >
                        <Typography
                            variant="h5"
                            fontWeight={700}
                        >
                            Insgesamt
                        </Typography>

                        <Typography
                            variant="h4"
                            fontWeight={700}
                            color="primary.main"
                            sx={{
                                width: "110px",
                                textAlign: "right",
                                whiteSpace: "nowrap",
                                fontVariantNumeric:
                                    "tabular-nums",
                            }}
                        >
                            <NumberFormatComponent
                                value={totalPrice.toFixed(
                                    2
                                )}
                            />{" "}
                            €
                        </Typography>
                    </Box>

                    <Button
                        size="large"
                        variant="contained"
                        startIcon={
                            <ShoppingCartCheckoutOutlinedIcon />
                        }
                        onClick={
                            submitEinkauf
                        }
                        disabled={
                            submitting
                        }
                        sx={{
                            mt: 2,
                            width: "100%",
                        }}
                    >
                        {submitting
                            ? "Einkauf wird übermittelt …"
                            : `Einkauf bestätigen als ${
                                keycloak
                                    ?.tokenParsed
                                    ?.preferred_username ??
                                ""
                            }`}
                    </Button>
                </Stack>
            </Paper>
        </Stack>
    );
}