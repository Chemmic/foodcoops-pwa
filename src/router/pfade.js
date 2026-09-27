/**
 * ============================================================================
 * URLs der Anwendung
 * ============================================================================
 *
 * Einheitlich: deutsch, klein, Wörter mit Bindestrich, nach Bereich
 * gegliedert (/bereich/unterseite). Pfade nur hier ändern.
 *
 *   /                                  Start
 *   /profil                            Mein Profil
 *   /impressum                         Impressum
 *   /anmelden                          Anmelden
 *
 *   /bestellung/frisch                 Frisch bestellen
 *   /bestellung/brot                   Brot bestellen
 *   /einkauf                           Einkauf
 *
 *   /produkte/lager                    Lager verwalten
 *   /produkte/frisch                   Frisch-Sortiment
 *   /produkte/brot                     Brot-Sortiment
 *
 *   /konfiguration/zu-viel-zu-wenig    Kontrolle nach der Lieferung
 *   /konfiguration/bestelluebersicht   Bestellübersicht
 *   /konfiguration/pdf                 PDF-Übersicht
 *   /konfiguration/einstellungen       Einstellungen
 *   /konfiguration/deadline            Deadline
 *
 *   /organisation/bestellung           Bestellung beim Händler (Organisator)
 *   /organisation/lager                Lager auffüllen / Einkaufsliste
 *
 *   /verwaltung/statistik              Verwaltung (Admin)
 *   /verwaltung/mitglieder[/:id]
 *   /verwaltung/benutzer
 *
 * ============================================================================
 */

export const PFADE = {
    start: "/",
    profil: "/profil",
    impressum: "/impressum",
    anmelden: "/anmelden",

    bestellung: "/bestellung",
    bestellungFrisch: "/bestellung/frisch",
    bestellungBrot: "/bestellung/brot",

    einkauf: "/einkauf",

    produkte: "/produkte",
    produkteLager: "/produkte/lager",
    produkteFrisch: "/produkte/frisch",
    produkteBrot: "/produkte/brot",

    konfiguration: "/konfiguration",
    zuVielZuWenig: "/konfiguration/zu-viel-zu-wenig",
    bestelluebersicht: "/konfiguration/bestelluebersicht",
    pdfUebersicht: "/konfiguration/pdf",
    einstellungen: "/konfiguration/einstellungen",
    deadline: "/konfiguration/deadline",

    organisation: "/organisation",
    organisationBestellung: "/organisation/bestellung",
    organisationLager: "/organisation/lager",

    verwaltung: "/verwaltung",
    verwaltungStatistik: "/verwaltung/statistik",
    verwaltungMitglieder: "/verwaltung/mitglieder",
    verwaltungBenutzer: "/verwaltung/benutzer",
};


/**
 * Alte URLs -> neue URLs (für Lesezeichen und Links von früher).
 * Genauere Pfade zuerst; Groß-/Kleinschreibung egal.
 */
const ALTE_PFADE = [
    ["/home", PFADE.start],
    ["/about", PFADE.impressum],
    ["/login", PFADE.anmelden],

    ["/mainBestellung/brotbestellung", PFADE.bestellungBrot],
    ["/mainBestellung/bestellung", PFADE.bestellungFrisch],
    ["/mainBestellung", PFADE.bestellungFrisch],

    ["/mainEinkauf", PFADE.einkauf],

    ["/mainManagement/frischbestandmanagement", PFADE.produkteFrisch],
    ["/mainManagement/brotbestandmanagement", PFADE.produkteBrot],
    ["/mainManagement/lager", PFADE.produkteLager],
    ["/mainManagement", PFADE.produkteLager],

    ["/mainAdmin/zuVielzuWenig", PFADE.zuVielZuWenig],
    ["/mainAdmin/OrderOverview", PFADE.bestelluebersicht],
    ["/mainAdmin/pdfOverview", PFADE.pdfUebersicht],
    ["/mainAdmin/config", PFADE.einstellungen],
    ["/mainAdmin/deadline", PFADE.deadline],
    ["/mainAdmin/benutzer", PFADE.verwaltungBenutzer],
    ["/mainAdmin", PFADE.zuVielZuWenig],

    ["/bestellungFestlegen", PFADE.organisationBestellung],
    ["/bestellung-festlegen", PFADE.organisationBestellung],
];


/** Neue URL für eine alte, sonst null. */
export const neuerPfad = pathname => {
    const pfad =
        pathname.toLowerCase().replace(/\/+$/, "");

    const treffer =
        ALTE_PFADE.find(([alt]) => {
            const a = alt.toLowerCase();
            return pfad === a || pfad.startsWith(`${a}/`);
        });

    return treffer ? treffer[1] : null;
};


/**
 * Ist der Pfad (oder eine Unterseite davon) gerade offen?
 * Segmentgenau: /bestellung passt nicht auf /bestellungen o.ä.
 */
export const istAktiv = (pathname, pfad) =>
    pfad === PFADE.start
        ? pathname === PFADE.start
        : pathname === pfad || pathname.startsWith(`${pfad}/`);
