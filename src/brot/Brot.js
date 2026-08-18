import React from "react";

import "bootstrap/dist/css/bootstrap.min.css";

import Button from "react-bootstrap/Button";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Alert from "@mui/material/Alert";

import { useApi } from "../ApiService";
import { BrotTable } from "./BrotTable";
import { DeadlineLogic } from "../deadline/DeadlineLogic";
import NumberFormatComponent from "../logic/NumberFormatComponent";
import { useAuth } from "../auth/AuthContext";


// =============================================================================
// Hilfsfunktionen
// =============================================================================
//
// Unterstützt sowohl:
//
// Neues Backend:
//
// [
//   {...},
//   {...}
// ]
//
// als auch das alte HAL-Format:
//
// {
//   "_embedded": {
//      "brotBestandRepresentationList": [...]
//   }
// }
//
// =============================================================================

const extractArray = (response, embeddedKey) => {

    if (Array.isArray(response)) {
        return response;
    }

    return response?._embedded?.[embeddedKey] ?? [];
};


const parseResponse = async (response, description) => {

    if (!response.ok) {
        throw new Error(
            `${description}: HTTP ${response.status}`
        );
    }

    return response.json();
};


// =============================================================================
// Brot
// =============================================================================

export function Brot() {

    // =========================================================================
    // Tabelle
    // =========================================================================

    const columns = React.useMemo(
        () => [
            {
                Header: "BrotID",
                accessor: "id"
            },
            {
                Header: "Brotname",
                accessor: "name"
            },
            {
                Header: "Gewicht in g",
                accessor: "gewicht",

                Cell: ({ value }) => (
                    <NumberFormatComponent
                        value={value}
                        includeFractionDigits={false}
                    />
                )
            },
            {
                Header: "Preis in €",
                accessor: "preis",

                Cell: ({ value }) => (
                    <NumberFormatComponent
                        value={value}
                    />
                )
            },
            {
                Header: "aktuelle Bestellmenge",
                accessor: "bestellmengeNeu",

                Cell: ({ value }) => (
                    <NumberFormatComponent
                        value={isNaN(value) ? 0 : value}
                        includeFractionDigits={false}
                    />
                )
            },
            {
                Header: "Bestellmenge",
                accessor: "bestellmenge",

                Cell: ({ value }) => (
                    <NumberFormatComponent
                        value={value}
                    />
                )
            }
        ],
        []
    );


    // =========================================================================
    // State
    // =========================================================================

    const [brotBestellung, setBrotBestellung] =
        React.useState([]);

    const [
        lastWeekBrotBestellung,
        setLastWeekBrotBestellung
    ] = React.useState([]);

    const [
        brotBestellungSumme,
        setBrotBestellungSumme
    ] = React.useState([]);

    const [data, setData] =
        React.useState([]);

    const [isLoading, setIsLoading] =
        React.useState(true);

    const [isAlsoLoading, setIsAlsoLoading] =
        React.useState(true);


    const [reducerValue, forceUpdate] =
        React.useReducer(
            value => value + 1,
            0
        );


    // =========================================================================
    // Services
    // =========================================================================

    const api = useApi();

    const { keycloak } = useAuth();


    // =========================================================================
    // Daten laden
    // =========================================================================

    React.useEffect(
        () => {

            let cancelled = false;


            const personId =
                keycloak?.tokenParsed?.preferred_username;


            // -----------------------------------------------------------------
            // Summe aller aktuellen Brotbestellungen
            // -----------------------------------------------------------------

            setIsAlsoLoading(true);

            api.readBrotBestellungProProdukt()
                .then(response =>
                    parseResponse(
                        response,
                        "Brotbestellungssumme konnte nicht geladen werden"
                    )
                )
                .then(response => {

                    if (cancelled) {
                        return;
                    }

                    const result = extractArray(
                        response,
                        "brotBestellungRepresentationList"
                    );

                    console.log(
                        "[Brot] Bestellsummen:",
                        result
                    );

                    setBrotBestellungSumme(result);
                })
                .catch(error => {

                    console.error(
                        "[Brot] Fehler beim Laden der Bestellsummen:",
                        error
                    );

                    if (!cancelled) {
                        setBrotBestellungSumme([]);
                    }
                })
                .finally(() => {

                    if (!cancelled) {
                        setIsAlsoLoading(false);
                    }
                });


            // -----------------------------------------------------------------
            // Brotbestand
            // -----------------------------------------------------------------

            setIsLoading(true);

            api.readBrotBestand()
                .then(response =>
                    parseResponse(
                        response,
                        "Brotbestand konnte nicht geladen werden"
                    )
                )
                .then(response => {

                    if (cancelled) {
                        return;
                    }

                    const result = extractArray(
                        response,
                        "brotBestandRepresentationList"
                    );

                    console.log(
                        "[Brot] Brotbestand:",
                        result
                    );

                    setData(result);
                })
                .catch(error => {

                    console.error(
                        "[Brot] Fehler beim Laden des Brotbestands:",
                        error
                    );

                    if (!cancelled) {
                        setData([]);
                    }
                })
                .finally(() => {

                    if (!cancelled) {
                        setIsLoading(false);
                    }
                });


            // Ohne Benutzer können keine persönlichen
            // Bestellungen geladen werden.

            if (!personId) {

                console.warn(
                    "[Brot] Kein preferred_username im Keycloak-Token."
                );

                setBrotBestellung([]);
                setLastWeekBrotBestellung([]);

                return () => {
                    cancelled = true;
                };
            }


            // -----------------------------------------------------------------
            // Eigene aktuelle Brotbestellungen
            // -----------------------------------------------------------------

            api.readBrotBestellungProPerson(personId)
                .then(response =>
                    parseResponse(
                        response,
                        "Eigene Brotbestellungen konnten nicht geladen werden"
                    )
                )
                .then(response => {

                    if (cancelled) {
                        return;
                    }

                    const result = extractArray(
                        response,
                        "brotBestellungRepresentationList"
                    );

                    console.log(
                        "[Brot] Eigene Bestellungen:",
                        result
                    );

                    setBrotBestellung(result);
                })
                .catch(error => {

                    console.error(
                        "[Brot] Fehler beim Laden der eigenen Bestellungen:",
                        error
                    );

                    if (!cancelled) {
                        setBrotBestellung([]);
                    }
                });


            // -----------------------------------------------------------------
            // Brotbestellungen aus der Vorwoche
            // -----------------------------------------------------------------

            api.readBrotBestellungBetweenDatesProPerson(
                personId
            )
                .then(response =>
                    parseResponse(
                        response,
                        "Vorwochenbestellung konnte nicht geladen werden"
                    )
                )
                .then(response => {

                    if (cancelled) {
                        return;
                    }

                    const result = extractArray(
                        response,
                        "brotBestellungRepresentationList"
                    );

                    console.log(
                        "[Brot] Vorwochenbestellungen:",
                        result
                    );

                    setLastWeekBrotBestellung(result);
                })
                .catch(error => {

                    console.error(
                        "[Brot] Fehler beim Laden der Vorwochenbestellung:",
                        error
                    );

                    if (!cancelled) {
                        setLastWeekBrotBestellung([]);
                    }
                });


            return () => {
                cancelled = true;
            };
        },
        [reducerValue]
    );


    // =========================================================================
    // Tabellen-Daten zusammensetzen
    // =========================================================================
    //
    // Wichtig:
    //
    // Wir verändern hier NICHT mehr direkt den React-State `data`.
    //
    // Stattdessen erzeugen wir für die Tabelle neue Objekte.
    //
    // =========================================================================

    const tableData = React.useMemo(
        () => {

            return data.map(brot => {

                const summe =
                    brotBestellungSumme.find(
                        bestellung =>
                            String(
                                bestellung?.brotbestand?.id
                            ) === String(brot.id)
                    );


                const vorwoche =
                    lastWeekBrotBestellung.find(
                        bestellung =>
                            String(
                                bestellung?.brotbestand?.id
                            ) === String(brot.id)
                    );


                const aktuelleBestellung =
                    brotBestellung.find(
                        bestellung =>
                            String(
                                bestellung?.brotbestand?.id
                            ) === String(brot.id)
                    );


                return {
                    ...brot,

                    bestellsumme:
                        summe?.bestellmenge ?? 0,

                    bestellmengeAlt:
                        vorwoche?.bestellmenge ?? null,

                    bestellmengeNeu:
                        aktuelleBestellung?.bestellmenge ?? 0
                };
            });
        },
        [
            data,
            brotBestellungSumme,
            lastWeekBrotBestellung,
            brotBestellung
        ]
    );


    // =========================================================================
    // Prüfen, ob bereits bestellt wurde
    // =========================================================================

    const checkAlreadyOrdered = (brotBestandId) => {

        const found =
            brotBestellung.find(
                bestellung =>
                    String(
                        bestellung?.brotbestand?.id
                    ) === String(brotBestandId)
            );


        return found?.id ?? null;
    };


    // =========================================================================
    // Eingabefelder leeren
    // =========================================================================

    const clearInputFields = () => {

        for (
            let i = 0;
            i < tableData.length;
            i++
        ) {

            const input =
                document.getElementById(
                    `Inputfield${i}`
                );

            if (input) {
                input.value = "";
            }
        }
    };


    // =========================================================================
    // Bestellung speichern
    // =========================================================================

    const submitBestellung = async () => {

        const personId =
            keycloak?.tokenParsed?.preferred_username;


        if (!personId) {

            toast.error(
                "Der angemeldete Benutzer konnte nicht ermittelt werden."
            );

            return;
        }


        const apiCalls = [];


        for (
            let i = 0;
            i < tableData.length;
            i++
        ) {

            const brot =
                tableData[i];


            const input =
                document.getElementById(
                    `Inputfield${i}`
                );


            if (!input) {
                continue;
            }


            const inputValue =
                input.value;


            // Leeres Feld = nichts ändern

            if (inputValue === "") {
                continue;
            }


            const bestellmenge =
                Number(inputValue);


            if (
                Number.isNaN(bestellmenge) ||
                bestellmenge < 0
            ) {

                toast.error(
                    `Ungültige Bestellmenge für "${brot.name}".`
                );

                return;
            }


            const existingOrderId =
                checkAlreadyOrdered(
                    brot.id
                );


            // -------------------------------------------------------------
            // Existierende Bestellung + Menge 0 -> löschen
            // -------------------------------------------------------------

            if (
                existingOrderId !== null &&
                bestellmenge === 0
            ) {

                apiCalls.push(
                    api.deleteBrotBestellung(
                        existingOrderId
                    )
                );

                continue;
            }


            // -------------------------------------------------------------
            // Keine existierende Bestellung und Menge 0
            //
            // -> nichts anlegen
            // -------------------------------------------------------------

            if (
                existingOrderId === null &&
                bestellmenge === 0
            ) {
                continue;
            }


            // -------------------------------------------------------------
            // Request-Objekt
            // -------------------------------------------------------------

            const result = {

                personId,

                brotbestand: {
                    ...brot,
                    type: "brot"
                },

                bestellmenge,

                datum:
                    new Date().toISOString(),

                type: "brot"
            };


            // Interne UI-Felder sollten nicht Teil
            // des Brotbestands im Request sein.

            delete result.brotbestand.bestellsumme;
            delete result.brotbestand.bestellmengeAlt;
            delete result.brotbestand.bestellmengeNeu;
            delete result.brotbestand.bestellmenge;


            // -------------------------------------------------------------
            // Update / Create
            // -------------------------------------------------------------

            if (existingOrderId !== null) {

                apiCalls.push(
                    api.updateBrotBestellung(
                        result,
                        existingOrderId
                    )
                );

            } else {

                apiCalls.push(
                    api.createBrotBestellung(
                        result
                    )
                );
            }
        }


        // Keine Änderungen

        if (apiCalls.length === 0) {

            toast.info(
                "Es wurden keine Änderungen eingegeben."
            );

            return;
        }


        try {

            const responses =
                await Promise.all(apiCalls);


            const failedResponse =
                responses.find(
                    response =>
                        !response.ok
                );


            if (failedResponse) {

                console.error(
                    "[Brot] Bestellung fehlgeschlagen:",
                    failedResponse.status
                );

                toast.error(
                    "Es gab einen Fehler beim Übermitteln Ihrer Bestellung. Bitte versuchen Sie es erneut."
                );

                return;
            }


            toast.success(
                "Ihre Bestellung wurde übermittelt. Vielen Dank!"
            );


            clearInputFields();


            const preisElement =
                document.getElementById(
                    "preis"
                );


            if (preisElement) {
                preisElement.innerHTML =
                    "Preis: 0,00 €";
            }


            // Daten neu vom Backend laden

            forceUpdate();


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } catch (error) {

            console.error(
                "[Brot] Fehler beim Übermitteln:",
                error
            );


            toast.error(
                "Es gab einen Fehler beim Übermitteln Ihrer Bestellung. Bitte versuchen Sie es erneut."
            );
        }
    };


    // =========================================================================
    // Content
    // =========================================================================

    const content = () => {

        if (
            isLoading ||
            isAlsoLoading
        ) {

            return (
                <div style={{ padding: "1rem" }}>
                    Brotbestellungen werden geladen...
                </div>
            );
        }


        return (
            <BrotTable
                columns={columns}
                data={tableData}
            />
        );
    };


    // =========================================================================
    // Render
    // =========================================================================

    return (
        <div>

            <div
                style={{
                    overflowX: "auto",
                    width: "100%"
                }}
            >

                <DeadlineLogic />


                <Alert
                    severity="info"
                    style={{
                        margin: "0.5em 1em 0.5em 1em"
                    }}
                >
                    Die aktuelle Bestellmenge eines Produktes
                    kann geändert werden, indem die neue
                    Bestellmenge in das Eingabefeld eingetragen
                    wird und anschließend auf
                    {" "}
                    <b>„Bestellung bestätigen“</b>
                    {" "}
                    geklickt wird.
                </Alert>


                {content()}


                <h4 id="preis">
                </h4>


                <Button
                    className="buttonForSubmitting"
                    variant="success"
                    onClick={submitBestellung}
                >
                    Bestellung bestätigen als{" "}

                    <b>
                        {
                            keycloak?.tokenParsed
                                ?.preferred_username
                        }
                    </b>
                </Button>

            </div>

        </div>
    );
}