/**
 * ============================================================================
 * Rollen
 * ============================================================================
 *
 * Die Admin-Rolle schaltet die Benutzerverwaltung frei
 * (Konfiguration -> Benutzer & Rollen).
 *
 * Muss zur Backend-Einstellung KEYCLOAK_ADMIN_ROLE passen.
 */

export const ADMIN_ROLE =
    import.meta.env
        .VITE_KEYCLOAK_ADMIN_ROLE ||
    "Admin";


export const EINKAEUFER_ROLE =
    "Einkäufer";


/**
 * Legt fest, was final beim Händler bestellt wird (Seite Organisation).
 * Muss zur Backend-Einstellung KEYCLOAK_ORGANISATOR_ROLE passen.
 */
export const ORGANISATOR_ROLE =
    import.meta.env
        .VITE_KEYCLOAK_ORGANISATOR_ROLE ||
    "Organisator";
