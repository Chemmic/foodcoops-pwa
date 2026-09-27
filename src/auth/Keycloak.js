import Keycloak from "keycloak-js";


/**
 * ============================================================================
 * Keycloak Configuration
 * ============================================================================
 *
 * Production / Docker:
 *
 * VITE_KEYCLOAK_URL=/auth/
 *
 * Local development:
 *
 * VITE_KEYCLOAK_URL=http://localhost:8089/
 *
 * Optional:
 *
 * VITE_KEYCLOAK_REALM=foodcoop
 * VITE_KEYCLOAK_CLIENT_ID=foodcoop-pwa
 *
 * WICHTIG:
 *
 * Niemals ein Keycloak Client Secret als VITE_* Variable
 * in das Frontend schreiben.
 *
 * VITE_* Werte werden Bestandteil des Browser-Bundles
 * und sind damit für Benutzer einsehbar.
 */

export const keycloakConfig = {
    url:
        import.meta.env
            .VITE_KEYCLOAK_URL ||
        "/auth/",

    realm:
        import.meta.env
            .VITE_KEYCLOAK_REALM ||
        "foodcoop",

    clientId:
        import.meta.env
            .VITE_KEYCLOAK_CLIENT_ID ||
        "foodcoop-pwa",
};


export const keycloak =
    new Keycloak(
        keycloakConfig
    );


/**
 * ============================================================================
 * Token
 * ============================================================================
 */

/**
 * Liefert ein gültiges Access Token.
 *
 * Falls das Token innerhalb der nächsten 30 Sekunden
 * abläuft, wird es vorher aktualisiert.
 */
export async function getAccessToken() {
    if (!keycloak.authenticated) {
        return null;
    }


    try {
        await keycloak.updateToken(
            30
        );
    } catch (error) {
        console.error(
            "[Keycloak] Token konnte nicht aktualisiert werden:",
            error
        );

        return null;
    }


    return keycloak.token ??
        null;
}
