import React from "react";


// =============================================================================
// Backend URL
// =============================================================================
//
// Lokal:
//
//   VITE_BACKEND_URL=http://localhost:8080/
//
// Produktion:
//
//   VITE_BACKEND_URL=/api/
//
// Der abschließende Slash wird hier entfernt.
// apiUrl(...) setzt die Pfade danach sauber zusammen.
//
// =============================================================================

const BACKEND_URL = (
    import.meta.env.VITE_BACKEND_URL || "/api/"
).replace(/\/+$/, "");


const apiUrl = (...parts) => {
    const path = parts
        .filter(
            part =>
                part !== undefined &&
                part !== null &&
                part !== ""
        )
        .map(
            part =>
                String(part)
                    .replace(/^\/+/, "")
                    .replace(/\/+$/, "")
        )
        .join("/");

    return path
        ? `${BACKEND_URL}/${path}`
        : BACKEND_URL;
};


const JSON_HEADERS = {
    "Content-Type": "application/json"
};


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
    fetch(
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
    fetch(
        apiUrl(
            PRODUKTE,
            id
        )
    );


const deleteProdukt = (
    id
) =>
    fetch(
        apiUrl(
            PRODUKTE,
            id
        ),
        {
            method: "DELETE",
            headers: JSON_HEADERS
        }
    );


const updateProdukt = (
    id,
    changedData
) =>
    fetch(
        apiUrl(
            PRODUKTE,
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


// =============================================================================
// Kategorie
// =============================================================================

const readKategorie = (
    id = undefined
) =>
    fetch(
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
    fetch(
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
    fetch(
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
    fetch(
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
    fetch(
        apiUrl(
            EINHEITEN,
            id
        )
    );


const createEinheit = (
    name
) =>
    fetch(
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
    fetch(
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
    fetch(
        apiUrl(
            FRISCHBESTELLUNG
        )
    );


const createFrischBestellung = (
    data
) =>
    fetch(
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
    fetch(
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
        fetch(
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
        fetch(
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
        fetch(
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
        fetch(
            apiUrl(
                FRISCHBESTELLUNG,
                PERSON,
                personId
            )
        );


const deleteFrischBestellung = (
    id
) =>
    fetch(
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
    fetch(
        apiUrl(
            FRISCHBESTAND,
            id
        )
    );


const createFrischBestand = (
    data
) =>
    fetch(
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


const updateFrischBestand = (
    id,
    changedData
) =>
    fetch(
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
    fetch(
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
    fetch(
        apiUrl(
            BROTBESTELLUNG
        )
    );


const createBrotBestellung = (
    data
) =>
    fetch(
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
    fetch(
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
        fetch(
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
        fetch(
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
        fetch(
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
        fetch(
            apiUrl(
                BROTBESTELLUNG,
                PERSON,
                personId
            )
        );


const deleteBrotBestellung = (
    id
) =>
    fetch(
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
    fetch(
        apiUrl(
            BROTBESTAND,
            id
        )
    );


const createBrotBestand = (
    data
) =>
    fetch(
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


const updateBrotBestand = (
    id,
    changedData
) =>
    fetch(
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
    fetch(
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
    fetch(
        apiUrl(
            DEADLINE,
            id
        )
    );


const readLastDeadline = () =>
    fetch(
        apiUrl(
            DEADLINE,
            LAST
        )
    );


const readCurrentDeadline = (
    id
) =>
    fetch(
        apiUrl(
            DEADLINE,
            CURRENT,
            id
        )
    );


const createDeadline = (
    data
) =>
    fetch(
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
    fetch(
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
    fetch(
        apiUrl(
            EINKAUF,
            id
        )
    );


const createEinkaufPdf = (
    id,
    email
) =>
    fetch(
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
    fetch(
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
    fetch(
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
    fetch(
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
    fetch(
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
    fetch(
        apiUrl(
            BESTELLUEBERSICHT,
            LAST
        )
    );


// =============================================================================
// Zu-viel / Zu-wenig Übersicht
// =============================================================================

const readDiscrepancyOverviwe = () =>
    fetch(
        apiUrl(
            BESTELLUEBERSICHT,
            LAST
        )
    );


const updateDiscrepancy = (
    id,
    data
) =>
    fetch(
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
        fetch(
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
    fetch(
        apiUrl(
            CONFIG
        )
    );


const updateConfig = (
    data
) =>
    fetch(
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
    fetch(
        apiUrl(
            GEBINDE
        )
    );


const updateGebindeOverview = (
    id,
    data
) =>
    fetch(
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
        fetch(
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
        fetch(
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
        fetch(
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
        fetch(
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
    fetch(
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
    fetch(
        apiUrl(
            PDF,
            DOWNLOAD,
            "bestellUebersicht"
        )
    );


const getUebersichtBrotPdf = () =>
    fetch(
        apiUrl(
            PDF,
            DOWNLOAD,
            "brotBestellungen"
        )
    );


const getUebersichtFrischPdf = () =>
    fetch(
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
    fetch(
        apiUrl(
            PDF,
            BYTE,
            "bestellUebersicht"
        )
    );


const getUebersichtBrotByte = () =>
    fetch(
        apiUrl(
            PDF,
            BYTE,
            "brotBestellungen"
        )
    );


const getUebersichtFrischByte = () =>
    fetch(
        apiUrl(
            PDF,
            BYTE,
            "frischBestellungen"
        )
    );


const getBreadWithPersonPDFasByte = () =>
    fetch(
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

    // -------------------------------------------------------------------------
    // BrotBestand
    // -------------------------------------------------------------------------

    readBrotBestand,
    createBrotBestand,
    deleteBrotBestand,
    updateBrotBestand,

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