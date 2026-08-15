import Keycloak from "keycloak-js";


/**
 * Keycloak configuration.
 *
 * Production / Docker:
 *
 *   REACT_APP_KEYCLOAK_URL=/auth/
 *
 * Local development can use:
 *
 *   REACT_APP_KEYCLOAK_URL=http://localhost:8089/
 */

export const keycloakConfig = {
    url: process.env.REACT_APP_KEYCLOAK_URL || "/auth/",
    realm: process.env.REACT_APP_KEYCLOAK_REALM || "foodcoop",
    clientId:
        process.env.REACT_APP_KEYCLOAK_CLIENT_ID ||
        "foodcoop-pwa"
};


export const keycloak = new Keycloak(keycloakConfig);


/**
 * Returns all users having the given role.
 *
 * IMPORTANT:
 *
 * The frontend must NOT use a confidential Keycloak client and must
 * never contain a client secret.
 *
 * Therefore the frontend calls our backend instead. The backend can
 * then communicate with the Keycloak Admin API securely.
 *
 * Expected backend endpoint:
 *
 *   GET /keycloak/roles/{roleName}/users
 *
 * Browser request:
 *
 *   /api/keycloak/roles/{roleName}/users
 *
 * nginx forwards /api/... to the backend.
 */
export const getUsersOfRole = async (roleName) => {
    if (!roleName) {
        throw new Error("roleName must not be empty");
    }

    try {
        /*
         * Refresh the user's access token if it expires soon.
         */
        await keycloak.updateToken(30);

        if (!keycloak.token) {
            console.error("No Keycloak access token available");
            return null;
        }

        const url =
            `/api/keycloak/roles/${encodeURIComponent(roleName)}/users`;

        const response = await fetch(url, {
            method: "GET",

            headers: {
                "Authorization": `Bearer ${keycloak.token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            console.error(
                "Error fetching users of role:",
                response.status,
                response.statusText
            );

            return null;
        }

        return await response.json();

    } catch (error) {
        console.error(
            "Error fetching users of role:",
            error
        );

        return null;
    }
};