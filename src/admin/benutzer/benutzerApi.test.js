import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

vi.mock(
    "../../auth/Keycloak.js",
    () => ({
        getAccessToken:
            vi.fn(async () => "token-123"),
    })
);

import {
    createUser,
    deleteUser,
    getUsersOfRole,
    listUsers,
    setUserRoles,
} from "./benutzerApi.js";

import {
    generatePassword,
} from "./passwort.js";


const jsonResponse = (
    status,
    body
) =>
    new Response(
        body === undefined
            ? null
            : JSON.stringify(body),
        {
            status,
            headers: {
                "Content-Type":
                    "application/json",
            },
        }
    );


describe("benutzerApi", () => {
    beforeEach(() => {
        globalThis.fetch =
            vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });


    it("sends the Keycloak token", async () => {
        fetch.mockResolvedValue(
            jsonResponse(200, [])
        );

        await listUsers();

        const [
            url,
            options,
        ] = fetch.mock.calls[0];

        expect(url).toMatch(
            /\/keycloak\/admin\/users$/
        );

        expect(
            options.headers.get(
                "Authorization"
            )
        ).toBe("Bearer token-123");
    });


    it("sends JSON bodies and encodes ids", async () => {
        fetch.mockResolvedValue(
            jsonResponse(200, {})
        );

        await setUserRoles(
            "a/b",
            ["Einkäufer"]
        );

        const [
            url,
            options,
        ] = fetch.mock.calls[0];

        expect(url).toMatch(
            /\/keycloak\/admin\/users\/a%2Fb\/roles$/
        );

        expect(options.method).toBe("PUT");

        expect(
            JSON.parse(options.body)
        ).toEqual({
            roles: ["Einkäufer"],
        });
    });


    it("uses the backend error message", async () => {
        fetch.mockResolvedValue(
            jsonResponse(409, {
                message:
                    "Benutzername oder E-Mail-Adresse ist bereits vergeben.",
            })
        );

        await expect(
            createUser({
                username: "anna",
            })
        ).rejects.toThrow(
            "bereits vergeben"
        );
    });


    it("explains missing permissions", async () => {
        fetch.mockResolvedValue(
            new Response(null, {
                status: 403,
            })
        );

        await expect(
            listUsers()
        ).rejects.toThrow(
            "Berechtigung"
        );
    });


    it("handles 204 responses", async () => {
        fetch.mockResolvedValue(
            new Response(null, {
                status: 204,
            })
        );

        await expect(
            deleteUser("x")
        ).resolves.toBeNull();
    });


    it("getUsersOfRole never throws", async () => {
        fetch.mockRejectedValue(
            new Error("offline")
        );

        vi.spyOn(
            console,
            "error"
        ).mockImplementation(() => {});

        await expect(
            getUsersOfRole(
                "Einkaufsmanagement"
            )
        ).resolves.toEqual([]);
    });
});


describe("generatePassword", () => {
    it("contains every character class", () => {
        for (let i = 0; i < 50; i++) {
            const password =
                generatePassword();

            expect(password).toHaveLength(12);
            expect(password).toMatch(/[a-z]/);
            expect(password).toMatch(/[A-Z]/);
            expect(password).toMatch(/[2-9]/);
            expect(password).toMatch(/[!?#%+-]/);
            expect(password).not.toMatch(/[0OIl1]/);
        }
    });
});
