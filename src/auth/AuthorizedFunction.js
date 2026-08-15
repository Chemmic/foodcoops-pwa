import { useAuth } from "./AuthContext";


export default function AuthorizedFunction(roles) {
    const { keycloak } = useAuth();

    if (keycloak && roles) {
        return roles.some(r => {
            const realm = keycloak.hasRealmRole(r);
            const resource = keycloak.hasResourceRole(r);
            return realm || resource;
        });
    }
    return false;
}
