import React, {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { keycloak } from "./Keycloak";


const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
    const [initialized, setInitialized] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);


    useEffect(() => {
        const initKeycloak = async () => {
            try {
                const isAuthenticated = await keycloak.init({
                    onLoad: "check-sso",
                    checkLoginIframe: false,
                    pkceMethod: "S256",
                    enableLogging: true
                });
                console.log(
                    "[Keycloak] initialized, authenticated:",
                    isAuthenticated
                );

                setAuthenticated(isAuthenticated);
            } catch (error) {
                console.error(
                    "[Keycloak] initialization failed:",
                    error
                );
            } finally {
                setInitialized(true);
            }
        };


        keycloak.onAuthSuccess = () => {
            console.log("[Keycloak] authentication successful");
            setAuthenticated(true);
        };


        keycloak.onAuthLogout = () => {
            console.log("[Keycloak] logout");
            setAuthenticated(false);
        };


        keycloak.onAuthError = (error) => {
            console.error("[Keycloak] authentication error:", error);
            setAuthenticated(false);
        };


        keycloak.onTokenExpired = async () => {
            console.log("[Keycloak] token expired");

            try {
                await keycloak.updateToken(30);
            } catch (error) {
                console.error(
                    "[Keycloak] token refresh failed:",
                    error
                );

                setAuthenticated(false);
            }
        };


        initKeycloak();
    }, []);


    const login = () => {
        return keycloak.login({
            redirectUri: window.location.origin + "/"
        });
    };


    const logout = () => {
        return keycloak.logout({
            redirectUri: window.location.origin + "/"
        });
    };


    if (!initialized) {
        return (
            <div>
                Anwendung wird geladen...
            </div>
        );
    }


    return (
        <AuthContext.Provider
            value={{
                keycloak,
                initialized,
                authenticated,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside an AuthProvider"
        );
    }

    return context;
};