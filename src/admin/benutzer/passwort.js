/**
 * Erzeugt ein zufälliges, gut lesbares Passwort
 * (ohne leicht verwechselbare Zeichen wie 0/O, 1/l/I).
 */

const LOWER = "abcdefghijkmnpqrstuvwxyz";
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const SYMBOLS = "!?#%+-";

const ALL =
    LOWER +
    UPPER +
    DIGITS +
    SYMBOLS;


const randomIndex = max => {
    const values =
        new Uint32Array(1);

    crypto.getRandomValues(
        values
    );

    return values[0] % max;
};


const pick = chars =>
    chars[
        randomIndex(
            chars.length
        )
    ];


export function generatePassword(
    length = 12
) {
    // Mindestens ein Zeichen aus jeder Gruppe
    const chars = [
        pick(LOWER),
        pick(UPPER),
        pick(DIGITS),
        pick(SYMBOLS),
    ];

    while (
        chars.length < length
    ) {
        chars.push(
            pick(ALL)
        );
    }

    // Fisher-Yates
    for (
        let i = chars.length - 1;
        i > 0;
        i--
    ) {
        const j =
            randomIndex(i + 1);

        [
            chars[i],
            chars[j],
        ] = [
            chars[j],
            chars[i],
        ];
    }

    return chars.join("");
}


export async function copyToClipboard(
    text
) {
    try {
        await navigator.clipboard.writeText(
            text
        );

        return true;
    } catch {
        return false;
    }
}
