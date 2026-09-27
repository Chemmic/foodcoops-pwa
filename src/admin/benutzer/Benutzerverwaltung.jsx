import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";

import { toast } from "react-toastify";

import { useAuth } from "../../auth/AuthContext.jsx";
import { ADMIN_ROLE } from "../../auth/roles.js";

import {
    createUser,
    deleteUser,
    listRoles,
    listUsers,
    logoutUser,
    sendActionsEmail,
    setUserPassword,
    setUserRoles,
    updateUser,
} from "./benutzerApi.js";

import { BenutzerDialog } from "./BenutzerDialog.jsx";
import { BestaetigungsDialog } from "./BestaetigungsDialog.jsx";
import { PasswortDialog } from "./PasswortDialog.jsx";
import { copyToClipboard } from "./passwort.js";


const ALLE_ROLLEN = "__alle__";
const OHNE_ROLLE = "__ohne__";


const REQUIRED_ACTION_LABELS = {
    UPDATE_PASSWORD:
        "muss Passwort ändern",
    VERIFY_EMAIL:
        "E-Mail unbestätigt",
    UPDATE_PROFILE:
        "muss Profil ergänzen",
    CONFIGURE_TOTP:
        "muss 2FA einrichten",
};


const fullName = user =>
    [
        user.firstName,
        user.lastName,
    ]
        .filter(Boolean)
        .join(" ");


const sameRoles = (
    a,
    b
) =>
    a.length === b.length &&
    a.every(
        role =>
            b.includes(role)
    );


// =============================================================================
// Zugangsdaten nach dem Anlegen anzeigen
// =============================================================================

function ZugangsdatenDialog({
    data,
    onClose,
}) {
    const copy = async () => {
        const copied =
            await copyToClipboard(
                `Benutzername: ${data.username}\nPasswort: ${data.password}`
            );

        if (copied) {
            toast.info(
                "Zugangsdaten kopiert."
            );
        }
    };


    return (
        <Dialog
            open={Boolean(data)}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle>
                Benutzer angelegt
            </DialogTitle>

            <DialogContent
                dividers
            >
                {data && (
                    <Stack spacing={2}>
                        <Typography>
                            Gib diese Zugangsdaten sicher weiter. Das
                            Passwort wird später nicht mehr angezeigt.
                        </Typography>

                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor:
                                    "action.hover",
                                fontFamily:
                                    "monospace",
                                wordBreak:
                                    "break-all",
                            }}
                        >
                            Benutzername: {data.username}
                            <br />
                            Passwort: {data.password}
                        </Box>

                        {data.temporary && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Beim ersten Anmelden muss ein eigenes
                                Passwort gewählt werden.
                            </Typography>
                        )}
                    </Stack>
                )}
            </DialogContent>

            <DialogActions>
                <Button
                    startIcon={
                        <ContentCopyOutlinedIcon />
                    }
                    onClick={copy}
                >
                    Kopieren
                </Button>

                <Button
                    variant="contained"
                    onClick={onClose}
                >
                    Fertig
                </Button>
            </DialogActions>
        </Dialog>
    );
}


// =============================================================================
// Seite
// =============================================================================

export function Benutzerverwaltung() {
    const {
        keycloak,
    } = useAuth();

    const currentUserId =
        keycloak
            ?.tokenParsed
            ?.sub ?? null;


    const [
        users,
        setUsers,
    ] = useState([]);

    const [
        roles,
        setRoles,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        loadError,
        setLoadError,
    ] = useState(null);


    const [
        search,
        setSearch,
    ] = useState("");

    const [
        roleFilter,
        setRoleFilter,
    ] = useState(ALLE_ROLLEN);


    // Dialoge
    const [
        userDialog,
        setUserDialog,
    ] = useState({
        open: false,
        user: null,
    });

    const [
        passwordUser,
        setPasswordUser,
    ] = useState(null);

    const [
        confirm,
        setConfirm,
    ] = useState(null);

    const [
        confirmBusy,
        setConfirmBusy,
    ] = useState(false);

    const [
        credentials,
        setCredentials,
    ] = useState(null);

    const [
        menu,
        setMenu,
    ] = useState(null);


    // =========================================================================
    // Laden
    // =========================================================================

    const reload =
        useCallback(
            async () => {
                try {
                    const [
                        loadedUsers,
                        loadedRoles,
                    ] = await Promise.all([
                        listUsers(),
                        listRoles(),
                    ]);

                    setUsers(
                        loadedUsers ?? []
                    );

                    setRoles(
                        loadedRoles ?? []
                    );

                    setLoadError(null);
                } catch (error) {
                    setLoadError(
                        error.message
                    );
                } finally {
                    setLoading(false);
                }
            },
            []
        );


    useEffect(() => {
        reload();
    }, [reload]);


    // =========================================================================
    // Filter
    // =========================================================================

    const filteredUsers =
        useMemo(
            () => {
                const term =
                    search
                        .trim()
                        .toLowerCase();

                return users.filter(user => {
                    if (
                        roleFilter === OHNE_ROLLE &&
                        user.roles.length > 0
                    ) {
                        return false;
                    }

                    if (
                        roleFilter !== ALLE_ROLLEN &&
                        roleFilter !== OHNE_ROLLE &&
                        !user.roles.includes(
                            roleFilter
                        )
                    ) {
                        return false;
                    }

                    if (!term) {
                        return true;
                    }

                    return [
                        user.username,
                        user.email,
                        user.firstName,
                        user.lastName,
                    ]
                        .filter(Boolean)
                        .some(
                            value =>
                                value
                                    .toLowerCase()
                                    .includes(term)
                        );
                });
            },
            [
                users,
                search,
                roleFilter,
            ]
        );


    const disabledCount =
        users.filter(
            user =>
                !user.enabled
        ).length;


    // =========================================================================
    // Aktionen
    // =========================================================================

    const handleUserSubmit = async form => {
        const editingUser =
            userDialog.user;


        if (!editingUser) {
            const withPassword =
                form.zugang === "passwort";

            const created =
                await createUser({
                    username:
                        form.username.trim(),
                    email:
                        form.email.trim() || null,
                    firstName:
                        form.firstName.trim() || null,
                    lastName:
                        form.lastName.trim() || null,
                    enabled:
                        form.enabled,
                    roles:
                        form.roles,

                    password:
                        withPassword
                            ? form.password
                            : null,
                    temporaryPassword:
                        form.temporaryPassword,

                    sendSetupEmail:
                        !withPassword,
                });

            setUserDialog({
                open: false,
                user: null,
            });

            if (withPassword) {
                setCredentials({
                    username:
                        created.username,
                    password:
                        form.password,
                    temporary:
                        form.temporaryPassword,
                });
            } else {
                toast.success(
                    `Benutzer „${created.username}“ angelegt – die Einladung wurde verschickt.`
                );
            }

            await reload();
            return;
        }


        await updateUser(
            editingUser.id,
            {
                email:
                    form.email.trim(),
                firstName:
                    form.firstName,
                lastName:
                    form.lastName,
                enabled:
                    form.enabled,
            }
        );

        if (
            !sameRoles(
                form.roles,
                editingUser.roles
            )
        ) {
            await setUserRoles(
                editingUser.id,
                form.roles
            );
        }

        toast.success(
            `Benutzer „${editingUser.username}“ gespeichert.`
        );

        setUserDialog({
            open: false,
            user: null,
        });

        await reload();
    };


    const handleSetPassword = async (
        password,
        temporary
    ) => {
        await setUserPassword(
            passwordUser.id,
            password,
            temporary
        );

        toast.success(
            `Neues Passwort für „${passwordUser.username}“ gesetzt.`
        );

        setPasswordUser(null);
        await reload();
    };


    const handleSendResetEmail = async () => {
        await sendActionsEmail(
            passwordUser.id,
            ["UPDATE_PASSWORD"]
        );

        toast.success(
            `E-Mail an ${passwordUser.email} wurde verschickt.`
        );

        setPasswordUser(null);
    };


    const runConfirm = async () => {
        setConfirmBusy(true);

        try {
            await confirm.action();

            toast.success(
                confirm.success
            );

            setConfirm(null);

            await reload();
        } catch (error) {
            toast.error(
                error.message
            );
        } finally {
            setConfirmBusy(false);
        }
    };


    const askDelete = user =>
        setConfirm({
            title:
                "Benutzer löschen?",
            confirmLabel:
                "Löschen",
            text: (
                <>
                    <strong>{user.username}</strong> wird dauerhaft aus
                    Keycloak gelöscht und kann sich nicht mehr anmelden.
                    Bestellungen und Einkäufe in der Anwendung bleiben
                    erhalten.
                </>
            ),
            success:
                `Benutzer „${user.username}“ wurde gelöscht.`,
            action: () =>
                deleteUser(
                    user.id
                ),
        });


    const askLogout = user =>
        setConfirm({
            title:
                "Überall abmelden?",
            confirmLabel:
                "Abmelden",
            confirmColor:
                "primary",
            text: (
                <>
                    Alle aktiven Sitzungen von{" "}
                    <strong>{user.username}</strong> werden beendet –
                    z.B. wenn ein Gerät verloren gegangen ist.
                </>
            ),
            success:
                `${user.username} wurde auf allen Geräten abgemeldet.`,
            action: () =>
                logoutUser(
                    user.id
                ),
        });


    const askToggleEnabled = user =>
        setConfirm({
            title:
                user.enabled
                    ? "Konto deaktivieren?"
                    : "Konto aktivieren?",
            confirmLabel:
                user.enabled
                    ? "Deaktivieren"
                    : "Aktivieren",
            confirmColor:
                user.enabled
                    ? "error"
                    : "primary",
            text:
                user.enabled
                    ? (
                        <>
                            <strong>{user.username}</strong> kann sich
                            danach nicht mehr anmelden. Das Konto bleibt
                            erhalten und kann jederzeit wieder aktiviert
                            werden.
                        </>
                    )
                    : (
                        <>
                            <strong>{user.username}</strong> kann sich
                            danach wieder anmelden.
                        </>
                    ),
            success:
                user.enabled
                    ? `Konto „${user.username}“ deaktiviert.`
                    : `Konto „${user.username}“ aktiviert.`,
            action: () =>
                updateUser(
                    user.id,
                    {
                        enabled:
                            !user.enabled,
                    }
                ),
        });


    const askVerifyEmail = user =>
        setConfirm({
            title:
                "Bestätigungs-E-Mail senden?",
            confirmLabel:
                "Senden",
            confirmColor:
                "primary",
            text: (
                <>
                    An <strong>{user.email}</strong> wird ein Link zum
                    Bestätigen der E-Mail-Adresse geschickt.
                </>
            ),
            success:
                `E-Mail an ${user.email} wurde verschickt.`,
            action: () =>
                sendActionsEmail(
                    user.id,
                    ["VERIFY_EMAIL"]
                ),
        });


    const closeMenu = () =>
        setMenu(null);


    const menuAction =
        action =>
            () => {
                const user =
                    menu.user;

                closeMenu();
                action(user);
            };


    // =========================================================================
    // Render
    // =========================================================================

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: 300,

                    display: "flex",
                    alignItems:
                        "center",
                    justifyContent:
                        "center",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }


    const menuUser =
        menu?.user;

    const menuUserIsSelf =
        menuUser?.id === currentUserId;


    return (
        <Stack spacing={3}>
            <Box>
                <Typography
                    variant="h2"
                    gutterBottom
                >
                    Benutzer & Rollen
                </Typography>

                <Typography
                    color="text.secondary"
                >
                    Konten für die Anwendung anlegen, Rollen vergeben und
                    Passwörter zurücksetzen.
                </Typography>
            </Box>


            {loadError && (
                <Alert
                    severity="error"
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() => {
                                setLoading(true);
                                reload();
                            }}
                        >
                            Erneut versuchen
                        </Button>
                    }
                >
                    {loadError}
                </Alert>
            )}


            {/* Admin-Rolle kann das Backend in Keycloak nicht finden */}
            {!loading &&
                !loadError &&
                roles.length > 0 &&
                !roles.some(role => role.name === ADMIN_ROLE) && (
                <Alert severity="warning">
                    Die Rolle „{ADMIN_ROLE}“ kann hier nicht vergeben werden, weil das Backend
                    sie in Keycloak nicht findet. Lege sie unter Clients → foodcoop-pwa → Roles an
                    oder gib dem Service-Account von foodcoop-backend zusätzlich die Rolle
                    „view-realm“ (realm-management).
                </Alert>
            )}


            {/* ============================================================= */}
            {/* Benutzer                                                      */}
            {/* ============================================================= */}

            <Paper
                elevation={0}
                sx={{
                    p: {
                        xs: 2,
                        sm: 3,
                    },

                    border: 1,
                    borderColor:
                        "divider",
                }}
            >
                <Stack spacing={2}>
                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        spacing={1}
                        sx={{
                            alignItems: {
                                xs: "flex-start",
                                sm: "center",
                            },
                            justifyContent: "space-between",
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: "center", flexWrap: "wrap" }}
                        >
                            <Typography
                                variant="h5"
                            >
                                Benutzer
                            </Typography>

                            <Chip
                                size="small"
                                label={users.length}
                            />

                            {disabledCount > 0 && (
                                <Chip
                                    size="small"
                                    variant="outlined"
                                    label={`${disabledCount} deaktiviert`}
                                />
                            )}
                        </Stack>

                        <Stack
                            direction="row"
                            spacing={1}
                        >
                            <Tooltip title="Neu laden">
                                <IconButton
                                    onClick={reload}
                                    aria-label="Benutzer neu laden"
                                >
                                    <RefreshOutlinedIcon />
                                </IconButton>
                            </Tooltip>

                            <Button
                                variant="contained"
                                startIcon={
                                    <PersonAddAlt1OutlinedIcon />
                                }
                                onClick={() =>
                                    setUserDialog({
                                        open: true,
                                        user: null,
                                    })
                                }
                                disabled={Boolean(loadError)}
                            >
                                Benutzer anlegen
                            </Button>
                        </Stack>
                    </Stack>


                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        spacing={2}
                    >
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Suchen nach Name, Benutzername oder E-Mail"
                            value={search}
                            onChange={event =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchOutlinedIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <TextField
                            select
                            size="small"
                            label="Rolle"
                            value={roleFilter}
                            onChange={event =>
                                setRoleFilter(
                                    event.target.value
                                )
                            }
                            sx={{
                                minWidth: 200,
                            }}
                        >
                            <MenuItem value={ALLE_ROLLEN}>
                                Alle Rollen
                            </MenuItem>

                            <MenuItem value={OHNE_ROLLE}>
                                Ohne Rolle
                            </MenuItem>

                            {roles.map(role => (
                                <MenuItem
                                    key={role.name}
                                    value={role.name}
                                >
                                    {role.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>


                    <TableContainer
                        sx={{
                            border: 1,
                            borderColor:
                                "divider",
                            borderRadius: 2,
                        }}
                    >
                        <Table
                            size="small"
                            sx={{
                                minWidth: 720,
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        Benutzer
                                    </TableCell>

                                    <TableCell>
                                        E-Mail
                                    </TableCell>

                                    <TableCell>
                                        Rollen
                                    </TableCell>

                                    <TableCell>
                                        Status
                                    </TableCell>

                                    <TableCell
                                        align="right"
                                    >
                                        Aktionen
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            sx={{
                                                py: 4,
                                                textAlign:
                                                    "center",
                                                color:
                                                    "text.secondary",
                                            }}
                                        >
                                            {users.length === 0
                                                ? "Noch keine Benutzer vorhanden."
                                                : "Keine Benutzer gefunden."}
                                        </TableCell>
                                    </TableRow>
                                )}

                                {filteredUsers.map(user => {
                                    const isSelf =
                                        user.id === currentUserId;

                                    const name =
                                        fullName(user);

                                    return (
                                        <TableRow
                                            key={user.id}
                                            hover
                                            sx={{
                                                opacity:
                                                    user.enabled
                                                        ? 1
                                                        : 0.6,
                                            }}
                                        >
                                            <TableCell>
                                                <Typography
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    {user.username}

                                                    {isSelf && (
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            {" "}(du)
                                                        </Typography>
                                                    )}
                                                </Typography>

                                                {name && (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {name}
                                                    </Typography>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {user.email ? (
                                                    <Stack
                                                        direction="row"
                                                        spacing={0.5}
                                                        sx={{ alignItems: "center" }}
                                                    >
                                                        <span>
                                                            {user.email}
                                                        </span>

                                                        {user.emailVerified && (
                                                            <Tooltip title="E-Mail bestätigt">
                                                                <VerifiedOutlinedIcon
                                                                    fontSize="small"
                                                                    color="success"
                                                                />
                                                            </Tooltip>
                                                        )}
                                                    </Stack>
                                                ) : (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        –
                                                    </Typography>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <Stack
                                                    direction="row"
                                                    spacing={0.5}
                                                    sx={{ flexWrap: "wrap" }}
                                                    useFlexGap
                                                >
                                                    {user.roles.length === 0 && (
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            keine
                                                        </Typography>
                                                    )}

                                                    {user.roles.map(role => (
                                                        <Chip
                                                            key={role}
                                                            size="small"
                                                            label={role}
                                                            color={
                                                                role === ADMIN_ROLE
                                                                    ? "primary"
                                                                    : "default"
                                                            }
                                                        />
                                                    ))}
                                                </Stack>
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    variant="outlined"
                                                    color={
                                                        user.enabled
                                                            ? "success"
                                                            : "default"
                                                    }
                                                    label={
                                                        user.enabled
                                                            ? "Aktiv"
                                                            : "Deaktiviert"
                                                    }
                                                />

                                                {user.requiredActions.map(action => (
                                                    <Typography
                                                        key={action}
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{ display: "block" }}
                                                    >
                                                        {REQUIRED_ACTION_LABELS[action] ??
                                                            action}
                                                    </Typography>
                                                ))}
                                            </TableCell>

                                            <TableCell
                                                align="right"
                                                sx={{
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >
                                                <Tooltip title="Bearbeiten">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                            setUserDialog({
                                                                open: true,
                                                                user,
                                                            })
                                                        }
                                                        aria-label={`${user.username} bearbeiten`}
                                                    >
                                                        <EditOutlinedIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Passwort zurücksetzen">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                            setPasswordUser(user)
                                                        }
                                                        aria-label={`Passwort von ${user.username} zurücksetzen`}
                                                    >
                                                        <KeyOutlinedIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Weitere Aktionen">
                                                    <IconButton
                                                        size="small"
                                                        onClick={event =>
                                                            setMenu({
                                                                anchor:
                                                                    event.currentTarget,
                                                                user,
                                                            })
                                                        }
                                                        aria-label={`Weitere Aktionen für ${user.username}`}
                                                    >
                                                        <MoreVertIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Stack>
            </Paper>


            {/* ============================================================= */}
            {/* Menü & Dialoge                                                */}
            {/* ============================================================= */}

            <Menu
                anchorEl={menu?.anchor}
                open={Boolean(menu)}
                onClose={closeMenu}
            >
                {menuUser?.email &&
                    !menuUser.emailVerified && (
                    <MenuItem
                        onClick={menuAction(
                            askVerifyEmail
                        )}
                    >
                        <ListItemIcon>
                            <MarkEmailUnreadOutlinedIcon fontSize="small" />
                        </ListItemIcon>

                        <ListItemText>
                            Bestätigungs-E-Mail senden
                        </ListItemText>
                    </MenuItem>
                )}

                <MenuItem
                    onClick={menuAction(
                        askLogout
                    )}
                >
                    <ListItemIcon>
                        <LogoutOutlinedIcon fontSize="small" />
                    </ListItemIcon>

                    <ListItemText>
                        Auf allen Geräten abmelden
                    </ListItemText>
                </MenuItem>

                <MenuItem
                    disabled={menuUserIsSelf}
                    onClick={menuAction(
                        askToggleEnabled
                    )}
                >
                    <ListItemIcon>
                        {menuUser?.enabled
                            ? <BlockOutlinedIcon fontSize="small" />
                            : <CheckCircleOutlineIcon fontSize="small" />}
                    </ListItemIcon>

                    <ListItemText>
                        {menuUser?.enabled
                            ? "Konto deaktivieren"
                            : "Konto aktivieren"}
                    </ListItemText>
                </MenuItem>

                <MenuItem
                    disabled={menuUserIsSelf}
                    onClick={menuAction(
                        askDelete
                    )}
                    sx={{
                        color:
                            "error.main",
                    }}
                >
                    <ListItemIcon
                        sx={{
                            color:
                                "error.main",
                        }}
                    >
                        <DeleteOutlinedIcon fontSize="small" />
                    </ListItemIcon>

                    <ListItemText>
                        Benutzer löschen
                    </ListItemText>
                </MenuItem>
            </Menu>


            <BenutzerDialog
                open={userDialog.open}
                user={userDialog.user}
                roles={roles}
                adminRole={ADMIN_ROLE}
                isSelf={
                    Boolean(userDialog.user) &&
                    userDialog.user.id === currentUserId
                }
                onSubmit={handleUserSubmit}
                onClose={() =>
                    setUserDialog({
                        open: false,
                        user: null,
                    })
                }
            />

            <PasswortDialog
                open={Boolean(passwordUser)}
                user={passwordUser}
                onSetPassword={handleSetPassword}
                onSendEmail={handleSendResetEmail}
                onClose={() =>
                    setPasswordUser(null)
                }
            />

            <BestaetigungsDialog
                open={Boolean(confirm)}
                title={confirm?.title}
                confirmLabel={confirm?.confirmLabel}
                confirmColor={
                    confirm?.confirmColor ??
                    "error"
                }
                busy={confirmBusy}
                onConfirm={runConfirm}
                onClose={() =>
                    setConfirm(null)
                }
            >
                {confirm?.text}
            </BestaetigungsDialog>

            <ZugangsdatenDialog
                data={credentials}
                onClose={() =>
                    setCredentials(null)
                }
            />
        </Stack>
    );
}
