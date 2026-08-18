import { createTheme, alpha } from '@mui/material/styles';

const colors = {
    primary: {
        main: '#3F6F50',
        light: '#648B70',
        dark: '#2E573C',
        contrastText: '#FFFFFF',
    },

    secondary: {
        main: '#D18A3D',
        light: '#E1AB71',
        dark: '#A96828',
        contrastText: '#FFFFFF',
    },

    background: {
        default: '#F6F7F4',
        paper: '#FFFFFF',
    },

    text: {
        primary: '#1F2822',
        secondary: '#68716B',
        disabled: '#A1A8A3',
    },

    divider: '#E2E6E1',

    success: '#3B7A57',
    warning: '#C68725',
    error: '#C64A47',
    info: '#477A9C',
};

export const appColors = colors;

export const theme = createTheme({
        MuiCheckbox: {
        defaultProps: {
            color: 'primary',
        },

        styleOverrides: {
            root: {
                padding: 10,

                '& .MuiSvgIcon-root': {
                    fontSize: 24,
                },

                '@media (pointer: coarse)': {
                    padding: 12,

                    '& .MuiSvgIcon-root': {
                        fontSize: 28,
                    },
                },
            },
        },
    },
    palette: {
        mode: 'light',

        primary: colors.primary,
        secondary: colors.secondary,

        background: colors.background,

        text: colors.text,

        divider: colors.divider,

        success: {
            main: colors.success,
        },

        warning: {
            main: colors.warning,
        },

        error: {
            main: colors.error,
        },

        info: {
            main: colors.info,
        },
    },

    shape: {
        borderRadius: 10,
    },

    spacing: 8,

    typography: {
        fontFamily: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            'Helvetica',
            'Arial',
            'sans-serif',
        ].join(','),

        h1: {
            fontSize: '2rem',
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
        },

        h2: {
            fontSize: '1.5rem',
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
        },

        h3: {
            fontSize: '1.25rem',
            fontWeight: 650,
            lineHeight: 1.35,
        },

        h4: {
            fontSize: '1.125rem',
            fontWeight: 650,
            lineHeight: 1.4,
        },

        h5: {
            fontSize: '1rem',
            fontWeight: 650,
            lineHeight: 1.4,
        },

        h6: {
            fontSize: '0.9375rem',
            fontWeight: 650,
            lineHeight: 1.4,
        },

        body1: {
            fontSize: '1rem',
            lineHeight: 1.5,
        },

        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
        },

        button: {
            fontWeight: 600,
            textTransform: 'none',
        },
    },

    components: {
        MuiCssBaseline: {
            styleOverrides: {
                html: {
                    minHeight: '100%',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                },

                body: {
                    minHeight: '100%',
                    margin: 0,
                    backgroundColor: colors.background.default,
                    color: colors.text.primary,
                },

                '#root': {
                    minHeight: '100vh',
                },

                '*': {
                    boxSizing: 'border-box',
                },

                a: {
                    color: 'inherit',
                    textDecoration: 'none',
                },
            },
        },

        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },

            styleOverrides: {
                root: {
                    minHeight: 44,
                    borderRadius: 10,
                    paddingLeft: 18,
                    paddingRight: 18,
                },

                containedPrimary: {
                    '&:hover': {
                        backgroundColor: colors.primary.dark,
                    },
                },
            },
        },

        MuiIconButton: {
            styleOverrides: {
                root: {
                    minWidth: 44,
                    minHeight: 44,
                    borderRadius: 10,
                },
            },
        },

        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },

        MuiCard: {
            defaultProps: {
                elevation: 0,
            },

            styleOverrides: {
                root: {
                    border: `1px solid ${colors.divider}`,
                    borderRadius: 12,
                },
            },
        },

        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
            },
        },

        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 10,

                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.primary.light,
                    },

                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: 2,
                    },
                },
            },
        },

        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 14,
                },
            },
        },

        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 600,
                },
            },
        },

        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    fontSize: '0.8125rem',
                    borderRadius: 8,
                    padding: '8px 10px',
                },
            },
        },

        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    minHeight: 46,

                    '&.Mui-selected': {
                        backgroundColor: alpha(
                            colors.primary.main,
                            0.10
                        ),
                        color: colors.primary.dark,

                        '&:hover': {
                            backgroundColor: alpha(
                                colors.primary.main,
                                0.14
                            ),
                        },
                    },
                },
            },
        },
    },
});