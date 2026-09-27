import React from "react";


import {
    apiUrl,
    authFetch,
    JSON_HEADERS,
} from "./apiClient.js";


// =============================================================================
// API paths
// =============================================================================

const KATEGORIEN = "kategorien";
const PRODUKTE = "produkte";
const EINHEITEN = "einheiten";

const FRISCHBESTELLUNG = "frischBestellung";
const FRISCHBESTAND = "frischBestand";

const BROTBESTAND = "brotBestand";
const BROTBESTELLUNG = "brotBestellung";

const MENGE = "menge";
const PERSON = "person";

const CURRENT_ORDERS = "current";
const PREVIOUS = "previous";

const DEADLINE = "deadline";
const LAST = "last";
const CURRENT = "getEndDateOfDeadline";

const PREISHISTORIE = "preisHistorie";
const BESTAND = "bestand";

const EINKAUF = "einkauf";
const MAILTOEINKAUFSMANAGEMENT =
    "mailToEinkaufsmanagement";

const BESTANDBUYOBJECT =
    "einkaufe/create/bestandBuyObject";

const BESTELLUEBERSICHT =
    "bestellUebersicht";

const GEBINDE = "gebinde";
const DISCREPANCY = "discrepancy";
const ADD = "add";

const UPDATEDISCREPANCY =
    "update/tooMuchTooLittle";

const UPDATEGEBINDEOVERVIEW =
    "update/gebindeAmountToOrder";

const CONFIG = "configuration";

const EMAIL = "email";
const SEND = "send";

const PDF = "pdf";
const DOWNLOAD = "download";
const BYTE = "byte";


// =============================================================================
// Produkt
// =============================================================================

const createProdukt = (data) =>
    authFetch(
        apiUrl(PRODUKTE),
        {
            method: "POST",
            headers: JSON_HEADERS,

            body: JSON.stringify({
                ...data,
                id: "undefined"
            })
        }
    );


const readProdukt = (
    id = undefined
) =>
    authFetch(
        apiUrl(
            PRODUKTE,
            id
        )
    );


const deleteProdukt = (
    id
) =>
    authFetch(
        apiUrl(
            PRODUKTE,
            id
        ),
        {
            method: "DELETE",
            headers: JSON_HEADERS
        }
    );


/**
 * preisFuerBestand: neuer Preis gilt auch für die schon vorhandene Ware
 * (sonst behält sie ihren alten Preis und wird zuerst verkauft).
 */
const updateProdukt = (
    id,
    changedData,
    {
        preisFuerBestand = false,
    } = {}
) =>
    authFetch(
        apiUrl(
            PRODUKTE,
            id
        ) + (preisFuerBestand ? "?preisFuerBestand=true" : ""),
        {
            method: "PUT",
            headers: JSON_HEADERS,

            body: JSON.stringify(
                changedData
            )
        }
    );


/** Neue Lieferung einlagern – vorhandene Ware behält ihren Preis. */
const einlagernProdukt = (
    id,
    menge,
    preis
) =>
    authFetch(
        apiUrl(
            PRODUKTE,
            id,
            "einlagern"
        ),
        {
            method: "POST",
            headers: JSON_HEADERS,

            body: JSON.stringify({
                menge,
                preis,
            })
        }
    );


// =============================================================================
// Kategorie
// =============================================================================

const readKategorie = (
    id = undefined
) =>
    authFetch(
        apiUrl(
            KATEGORIEN,
            id
        )
    );


const createKategorie = (
    name,
    icon,
    mixable
) =>
    authFetch(
        apiUrl(KATEGORIEN),
        {
            method: "POST",
            headers: JSON_HEADERS,

            body: JSON.stringify({
                id: "",
                name,
                icon,
                mixable
            })
        }
    );


const updateKategorie = (
    id,
    name
) =>
    authFetch(
        apiUrl(
            KATEGORIEN,
            id
        ),
        {
            method: "POST",
            headers: JSON_HEADERS,

            body: JSON.stringify({
                name
            })
        }
    );


const deleteKategorie = (
    id
) =>
    authFetch(
        apiUrl(
            KATEGORIEN,
            id
        ),
        {
            method: "DELETE",
            headers: JSON_HEADERS
        }
    );


// =============================================================================
// Einheit
// =============================================================================

const readEinheit = (
    id = undefined
) =>
    authFetch(
        apiUrl(
            EINHEITEN,
            id
        )
    );


const createEinheit = (
    name
) =>
    authFetch(
        apiUrl(EINHEITEN),
        {
            method: "POST",
            headers: JSON_HEADERS,

            body: JSON.stringify({
                id: null,
                name
            })
        }
    );


const deleteEinheit = (
    id
) =>
    authFetch(
        apiUrl(
            EINHEITEN,
            id
        ),
        {
            method: "DELETE",
            headers: JSON_HEADERS
        }
    );


// =============================================================================
// FrischBestellung
// =============================================================================

const readFrischBestellung = () =>
    authFetch(
        apiUrl(
            FRISCHBESTELLUNG
        )
    );


const createFrischBestellung = (
    data
) =>
    authFetch(
        apiUrl(
            FRISCHBESTELLUNG
        ),
        {
            method: "POST",
            headers: JSON_HEADERS,

            body: JSON.stringify({
                ...data,
                id: "undefined"
            })
        }
    );


const updateFrischBestellung = (
    data,
    frischBestellungId
) =>
    authFetch(
        apiUrl(
            FRISCHBESTELLUNG,
            frischBestellungId
        ),
        {
            method: "PUT",
            headers: JSON_HEADERS,

            body: JSON.stringify({
                ...data,
                id: frischBestellungId
            })
        }
    );


/*
 * Aktuelle Bestellungen einer Person.
 *
 * GET /frischBestellung/current/person/{personId}
 */
const readFrischBestellungProPerson =
    (personId) =>
        authFetch(
            apiUrl(
                FRISCHBESTELLUNG,
                CURRENT_ORDERS,
                PERSON,
                personId
            )
        );


/*
 * Vorherige Bestellrunde einer Person.
 *
 * GET /frischBestellung/previous/person/{personId}
 */
const readFrischBestellungVorherigeProPerson =
    (personId) =>
        authFetch(
            apiUrl(
                FRISCHBESTELLUNG,
                PREVIOUS,
                PERSON,
                personId
            )
        );


/*
 * Summierte Bestellmenge aller Personen
 * für die aktuelle Deadline.
 *
 * GET /frischBestellung/current/menge
 */
const readFrischBestellungProProdukt =
    () =>
        authFetch(
            apiUrl(
                FRISCHBESTELLUNG,
                CURRENT_ORDERS,
                MENGE
            )
        );


/*
 * Komplette Bestellhistorie einer Person.
 *
 * GET /frischBestellung/person/{personId}
 */
const readFrischBestellungHistorieProPerson =
    (personId) =>
        authFetch(
            apiUrl(
                FRISCHBESTELLUNG,
                PERSON,
                personId
            )
        );


const deleteFrischBestellung = (
    id
) =>
    authFetch(
        apiUrl(
            FRISCHBESTELLUNG,
            id
        ),
        {
            method: "DELETE",
            headers: JSON_HEADERS
        }
    );


// =============================================================================
// FrischBestand
// =============================================================================

const readFrischBestand = (
    id = undefined
) =>
    authFetch(
        apiUrl(
            FRISCHBESTAND,
            id
        )
    );


const createFrischBestand = (
    data
) =>
    authFetch(
        apiUrl(
            FRISCHBESTAND
        ),
        {
            method: "POST",
            headers: JSON_HEADERS,

            body: JSON.stringify({
                ...data,
                id: "undefined"
            })
        }
    );


/** Reihenfolge der Frischwaren: IDs von oben nach unten. */
const updateFrischBestandReihenfolge = ids =>
    authFetch(
        apiUrl(
            FRISCHBESTAND,
            "reihenfolge"
        ),
        {
            method: "PUT",
            headers: JSON_HEADERS,

            body: JSON.stringify(ids)
        }
    );


const updateFrischBestand = (
    id,
    changedData
) =>
    authFetch(
        apiUrl(
            FRISCHBESTAND,
            id
        ),
        {
            method: "PUT",
            headers: JSON_HEADERS,

            body: JSON.stringify(
                changedData
            )
        }
    );


const deleteFrischBestand = (
    id
) =>
    authFetch(
        apiUrl(
            FRISCHBESTAND,
            id
        ),
        {
            method: "DELETE",
            headers: JSON_HEADERS
        }
    );


// =============================================================================
// BrotBestellung
// =============================================================================

const readBrotBestellung = () =>
    authFetch(
        apiUrl(
            BROTBESTELLUNG
        )
    );


const createBrotBestellung = (
    data
) =>
    authFetch(
        apiUrl(
            BROTBESTELLUNG
        ),
        {
            method: "POST",
            headers: JSON_HEADERS,

            body: JSON.stringify({
                ...data,
                id: "undefined"
            })
        }
    );


const updateBrotBestellung = (
    data,
    brotBestellungId
) =>
    authFetch(
        apiUrl(
            BROTBESTELLUNG,
            brotBestellungId
        ),
        {
            method: "PUT",
            headers: JSON_HEADERS,

            body: JSON.stringify({
                ...data,
                id: brotBestellungId
            })
        }
    );


/*
 * Aktuelle Brotbestellungen einer Person.
 *
 * GET /brotBestellung/current/person/{personId}
 */
const readBrotBestellungProPerson =
    (personId) =>
        authFetch(
            apiUrl(
                BROTBESTELLUNG,
                CURRENT_ORDERS,
                PERSON,
                personId
            )
        );


/*
 * Vorherige Brot-Bestellrunde einer Person.
 *
 * GET /brotBestellung/previous/person/{personId}
 */
const readBrotBestellungVorherigeProPerson =
    (personId) =>
        authFetch(
            apiUrl(
                BROTBESTELLUNG,
                PREVIOUS,
                PERSON,
                personId
            )
        );


/*
 * Summierte Brotbestellmenge aller Personen
 * für die aktuelle Deadline.
 *
 * GET /brotBestellung/current/menge
 */
const readBrotBestellungProProdukt =
    () =>
        authFetch(
            apiUrl(
                BROTBESTELLUNG,
                CURRENT_ORDERS,
                MENGE
            )
        );


/*
 * Komplette Brot-Bestellhistorie einer Person.
 *
 * GET /brotBestellung/person/{personId}
 */
const readBrotBestellungHistorieProPerson =
    (personId) =>
        authFetch(
            apiUrl(
                BROTBESTELLUNG,
                PERSON,
                personId
            )
        );


const deleteBrotBestellung = (
    id
) =>
    authFetch(
        apiUrl(
            BROTBESTELLUNG,
            id
        ),
        {
            method: "DELETE",
            headers: JSON_HEADERS
        }
    );


// =============================================================================
// BrotBestand
// =============================================================================

const readBrotBestand = (
    id = undefined
) =>
    authFetch(
        apiUrl(
            BROTBESTAND,
            id
        )
    );


const createBrotBestand = (
    data
) =>
    authFetch(
        apiUrl(
            BROTBESTAND
        ),
        {
            method: "POST",
            headers: JSON_HEADERS,

            body: JSON.stringify({
                ...data,
                id: "undefined"
            })
        }
    );


/** Reihenfolge der Brote: IDs von oben nach unten. */
const updateBrotBestandReihenfolge = ids =>
    authFetch(
        apiUrl(
            BROTBESTAND,
            "reihenfolge"
        ),
        {
            method: "PUT",
            headers: JSON_HEADERS,

            body: JSON.stringify(ids)
        }
    );


/** Reihenfolge der Lagerprodukte: IDs von oben nach unten. */
const updateProduktReihenfolge = ids =>
    authFetch(
        apiUrl(
            PRODUKTE,
            "reihenfolge"
        ),
        {
            method: "PUT",
            headers: JSON_HEADERS,

            body: JSON.stringify(ids)
        }
    );


const updateBrotBestand = (
    id,
    changedData
) =>
    authFetch(
        apiUrl(
            BROTBESTAND,
            id
        ),
        {
            method: "PUT",
            headers: JSON_HEADERS,

            body: JSON.stringify(
                changedData
            )
        }
    );


const deleteBrotBestand = (
    id
) =>
    authFetch(
        apiUrl(
            BROTBESTAND,
            id
        ),
        {
            method: "DELETE",
            headers: JSON_HEADERS
        }
    );


// =============================================================================
// Deadline
// =============================================================================

const readDeadline = (
    id = undefined
) =>
    authFetch(
        apiUrl(
            DEADLINE,
            id
        )
    );


const readLastDeadline = () =>
    authFetch(
        apiUrl(
            DEADLINE,
            LAST
        )
    );


const readCurrentDeadline = (
    id
) =>
    authFetch(
        apiUrl(
            DEADLINE,
            CURRENT,
            id
        )
    );


const createDeadline = (
    data
) =>
    authFetch(
        apiUrl(
            DEADLINE
        ),
        {
            method: "POST",
            headers: JSON_HEADERS,

            body: JSON.stringify({
                ...data,
                id: "undefined"
            })
        }
    );


// =============================================================================
// Preis-Historie
// =============================================================================
//
// GET /preisHistorie/bestand/{bestandId}
//
// =============================================================================

const readPreisHistorie = (
    bestandId
) =>
    authFetch(
        apiUrl(
            PREISHISTORIE,
            BESTAND,
            bestandId
        )
    );


// =============================================================================
// Einkauf
// =============================================================================

const readEinkauf = (
    id = undefined
) =>
    authFetch(
        apiUrl(
            EINKAUF,
            id
        )
    );


const createEinkaufPdf = (
    id,
    email
) =>
    authFetch(
        apiUrl(
            EINKAUF,
            PDF,
            id
        ),
        {
            method: "POST",
            headers: JSON_HEADERS,
            body: email
        }
    );


const createEinkauf = (
    data
) =>
    authFetch(
        apiUrl(
            EINKAUF
        ),
        {
            method: "POST",
            headers: JSON_HEADERS,

            body: JSON.stringify({
                ...data,
                id: "undefined"
            })
        }
    );


const deleteEinkauf = (
    id
) =>
    authFetch(
        apiUrl(
            EINKAUF,
            id
        ),
        {
            method: "DELETE",
            headers: JSON_HEADERS
        }
    );


const createBestandBuyObject = (
    data
) =>
    authFetch(
        apiUrl(
            BESTANDBUYOBJECT
        ),
        {
            method: "POST",
            headers: JSON_HEADERS,

            body: JSON.stringify({
                ...data,
                id: "undefined"
            })
        }
    );


const sendMailToEinkaufsmanagement = (
    id,
    data
) =>
    authFetch(
        apiUrl(
            EINKAUF,
            MAILTOEINKAUFSMANAGEMENT,
            id
        ),
        {
            method: "POST",
            headers: JSON_HEADERS,

            body: JSON.stringify(
                data
            )
        }
    );


// =============================================================================
// Bestellübersicht
// =============================================================================

const readBestellUebersicht = () =>
    authFetch(
        apiUrl(
            BESTELLUEBERSICHT,
            LAST
        )
    );


// =============================================================================
// Zu-viel / Zu-wenig Übersicht
// =============================================================================

const readDiscrepancyOverviwe = () =>
    authFetch(
        apiUrl(
            BESTELLUEBERSICHT,
            LAST
        )
    );


const updateDiscrepancy = (
    id,
    data
) =>
    authFetch(
        apiUrl(
            GEBINDE,
            DISCREPANCY,
            UPDATEDISCREPANCY,
            id
        ),
        {
            method: "PUT",
            headers: JSON_HEADERS,

            body: data
        }
    );


const addDiscrepancyToLastOrderList =
    (data) =>
        authFetch(
            apiUrl(
                GEBINDE,
                DISCREPANCY,
                ADD
            ),
            {
                method: "POST",
                headers: JSON_HEADERS,

                body: JSON.stringify(
                    data
                )
            }
        );


// =============================================================================
// Configuration
// =============================================================================

const readConfig = () =>
    authFetch(
        apiUrl(
            CONFIG
        )
    );


const updateConfig = (
    data
) =>
    authFetch(
        apiUrl(
            CONFIG
        ),
        {
            method: "PUT",
            headers: JSON_HEADERS,

            body: JSON.stringify(
                data
            )
        }
    );


// =============================================================================
// Gebinde Übersicht
// =============================================================================

const readGebindeOverview = () =>
    authFetch(
        apiUrl(
            GEBINDE
        )
    );


const updateGebindeOverview = (
    id,
    data
) =>
    authFetch(
        apiUrl(
            GEBINDE,
            DISCREPANCY,
            UPDATEGEBINDEOVERVIEW,
            id
        ),
        {
            method: "PUT",
            headers: JSON_HEADERS,

            body: data
        }
    );


// =============================================================================
// PDF / E-Mail
// =============================================================================

const sendTotalBestellUebersicht =
    (email) =>
        authFetch(
            apiUrl(
                EMAIL,
                SEND,
                "bestellUebersicht"
            ),
            {
                method: "POST",
                headers: JSON_HEADERS,

                body: email
            }
        );


const sendBrotOrder =
    (email) =>
        authFetch(
            apiUrl(
                EMAIL,
                SEND,
                "brotBestellungen"
            ),
            {
                method: "POST",
                headers: JSON_HEADERS,

                body: email
            }
        );


const sendFrischOrder =
    (email) =>
        authFetch(
            apiUrl(
                EMAIL,
                SEND,
                "frischBestellungen"
            ),
            {
                method: "POST",
                headers: JSON_HEADERS,

                body: email
            }
        );


const sendBreadOrderWithPersons =
    (email) =>
        authFetch(
            apiUrl(
                EMAIL,
                SEND,
                "brotBestellungenMitPersonen"
            ),
            {
                method: "POST",
                headers: JSON_HEADERS,

                body: email
            }
        );


const sendInventoryStatus = (
    email,
    base64String
) =>
    authFetch(
        apiUrl(
            EMAIL,
            SEND,
            "lagerbestand",
            email
        ),
        {
            method: "POST",
            headers: JSON_HEADERS,

            body: base64String
        }
    );


// =============================================================================
// PDF Download
// =============================================================================

const getBestellUebersichtPdf = () =>
    authFetch(
        apiUrl(
            PDF,
            DOWNLOAD,
            "bestellUebersicht"
        )
    );


const getUebersichtBrotPdf = () =>
    authFetch(
        apiUrl(
            PDF,
            DOWNLOAD,
            "brotBestellungen"
        )
    );


const getUebersichtFrischPdf = () =>
    authFetch(
        apiUrl(
            PDF,
            DOWNLOAD,
            "frischBestellungen"
        )
    );


// =============================================================================
// PDF als Base64 / Byte
// =============================================================================

const getBestellUebersichtByte = () =>
    authFetch(
        apiUrl(
            PDF,
            BYTE,
            "bestellUebersicht"
        )
    );


const getUebersichtBrotByte = () =>
    authFetch(
        apiUrl(
            PDF,
            BYTE,
            "brotBestellungen"
        )
    );


const getUebersichtFrischByte = () =>
    authFetch(
        apiUrl(
            PDF,
            BYTE,
            "frischBestellungen"
        )
    );


const getBreadWithPersonPDFasByte = () =>
    authFetch(
        apiUrl(
            PDF,
            BYTE,
            "brotMitPerson"
        )
    );


// =============================================================================
// API object
// =============================================================================

const DEFAULT_API = {
    // -------------------------------------------------------------------------
    // Produkt
    // -------------------------------------------------------------------------

    createProdukt,
    readProdukt,
    deleteProdukt,
    updateProdukt,
    updateProduktReihenfolge,
    einlagernProdukt,

    // -------------------------------------------------------------------------
    // Kategorie
    // -------------------------------------------------------------------------

    createKategorie,
    readKategorie,
    deleteKategorie,
    updateKategorie,

    // -------------------------------------------------------------------------
    // Einheit
    // -------------------------------------------------------------------------

    createEinheit,
    readEinheit,
    deleteEinheit,

    // -------------------------------------------------------------------------
    // FrischBestellung
    // -------------------------------------------------------------------------

    readFrischBestellung,

    readFrischBestellungProPerson,
    readFrischBestellungVorherigeProPerson,
    readFrischBestellungProProdukt,
    readFrischBestellungHistorieProPerson,

    createFrischBestellung,
    updateFrischBestellung,
    deleteFrischBestellung,

    // -------------------------------------------------------------------------
    // FrischBestand
    // -------------------------------------------------------------------------

    readFrischBestand,
    createFrischBestand,
    deleteFrischBestand,
    updateFrischBestand,
    updateFrischBestandReihenfolge,

    // -------------------------------------------------------------------------
    // BrotBestand
    // -------------------------------------------------------------------------

    readBrotBestand,
    createBrotBestand,
    deleteBrotBestand,
    updateBrotBestand,
    updateBrotBestandReihenfolge,

    // -------------------------------------------------------------------------
    // BrotBestellung
    // -------------------------------------------------------------------------

    readBrotBestellung,

    readBrotBestellungProPerson,
    readBrotBestellungVorherigeProPerson,
    readBrotBestellungProProdukt,
    readBrotBestellungHistorieProPerson,

    createBrotBestellung,
    updateBrotBestellung,
    deleteBrotBestellung,

    // -------------------------------------------------------------------------
    // Deadline
    // -------------------------------------------------------------------------

    readDeadline,
    readLastDeadline,
    readCurrentDeadline,
    createDeadline,

    // -------------------------------------------------------------------------
    // Preis-Historie
    // -------------------------------------------------------------------------

    readPreisHistorie,

    // -------------------------------------------------------------------------
    // Einkauf
    // -------------------------------------------------------------------------

    readEinkauf,
    createEinkaufPdf,
    createEinkauf,
    deleteEinkauf,
    createBestandBuyObject,
    sendMailToEinkaufsmanagement,

    // -------------------------------------------------------------------------
    // Bestellübersicht
    // -------------------------------------------------------------------------

    readBestellUebersicht,
    readDiscrepancyOverviwe,
    updateDiscrepancy,
    addDiscrepancyToLastOrderList,

    // -------------------------------------------------------------------------
    // Configuration
    // -------------------------------------------------------------------------

    readConfig,
    updateConfig,

    // -------------------------------------------------------------------------
    // Gebinde
    // -------------------------------------------------------------------------

    readGebindeOverview,
    updateGebindeOverview,

    // -------------------------------------------------------------------------
    // Mail
    // -------------------------------------------------------------------------

    sendTotalBestellUebersicht,
    sendBrotOrder,
    sendFrischOrder,
    sendBreadOrderWithPersons,
    sendInventoryStatus,

    // -------------------------------------------------------------------------
    // PDF
    // -------------------------------------------------------------------------

    getBestellUebersichtPdf,
    getUebersichtBrotPdf,
    getUebersichtFrischPdf,

    getBestellUebersichtByte,
    getUebersichtBrotByte,
    getUebersichtFrischByte,
    getBreadWithPersonPDFasByte
};


// =============================================================================
// React Context
// =============================================================================

const ApiContext =
    React.createContext(
        DEFAULT_API
    );


export const ApiProvider = ({
    children,
    ...overrides
}) => {
    const value = {
        ...DEFAULT_API,
        ...overrides
    };

    return (
        <ApiContext.Provider
            value={value}
        >
            {children}
        </ApiContext.Provider>
    );
};


export const useApi = () =>
    React.useContext(
        ApiContext
    );