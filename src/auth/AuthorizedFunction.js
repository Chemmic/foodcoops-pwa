import { useAuth } from "./AuthContext.jsx";


/**
 * Prüft, ob der übergebene Keycloak-Benutzer
 * mindestens eine der angegebenen Rollen besitzt.
 *
 * Es werden sowohl Realm-Rollen als auch
 * Client-/Resource-Rollen berücksichtigt.
 */
export function hasAnyRole(
    keycloak,
    roles
) {
    if (!keycloak) {
        return false;
    }

    if (
        !roles ||
        roles.length === 0
    ) {
        return true;
    }

    return roles.some(
        role =>
            keycloak.hasRealmRole(
                role
            ) ||
            keycloak.hasResourceRole(
                role
            )
    );
}


/**
 * React Hook für Komponenten.
 *
 * Beispiel:
 *
 * const canManageProducts =
 *     useAuthorized(["Einkäufer"]);
 */
export function useAuthorized(
    roles
) {
    const {
        keycloak,
        authenticated,
    } = useAuth();


    if (
        !authenticated ||
        !keycloak
    ) {
        return false;
    }


    return hasAnyRole(
        keycloak,
        roles
    );
}


/**
 * Alias für bestehenden Code.
 *
 * Falls ältere Komponenten bisher:
 *
 * AuthorizedFunction(["Einkäufer"])
 *
 * verwenden, funktioniert das vorerst weiter.
 *
 * Langfristig sollten diese Stellen auf
 * useAuthorized(...) umgestellt werden.
 */
export default function AuthorizedFunction(
    roles
) {
    return useAuthorized(
        roles
    );
}