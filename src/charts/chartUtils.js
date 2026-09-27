import {
    useEffect,
    useRef,
    useState,
} from "react";


/**
 * Breite eines Elements (für responsive SVG-Diagramme).
 */
export function useElementWidth(
    fallback = 600
) {
    const ref =
        useRef(null);

    const [
        width,
        setWidth,
    ] = useState(fallback);


    useEffect(() => {
        const element =
            ref.current;

        if (
            !element ||
            typeof ResizeObserver === "undefined"
        ) {
            return undefined;
        }

        const observer =
            new ResizeObserver(entries => {
                const next =
                    Math.floor(
                        entries[0]
                            .contentRect
                            .width
                    );

                if (next > 0) {
                    setWidth(next);
                }
            });

        observer.observe(element);

        return () =>
            observer.disconnect();
    }, []);


    return [
        ref,
        width,
    ];
}


/**
 * "Schöne" Achsenwerte: 0, 20, 40 … statt 0, 17,3, 34,6 …
 */
export function niceTicks(
    min,
    max,
    count = 4
) {
    if (
        !Number.isFinite(min) ||
        !Number.isFinite(max)
    ) {
        return [0, 1];
    }

    if (min === max) {
        max =
            min === 0
                ? 1
                : min + Math.abs(min) * 0.5;
    }

    const span =
        max - min;

    const rough =
        span / count;

    const magnitude =
        10 ** Math.floor(Math.log10(rough));

    const step =
        [1, 2, 2.5, 5, 10]
            .map(f => f * magnitude)
            .find(s => s >= rough) ??
        10 * magnitude;

    const start =
        Math.floor(min / step) * step;

    const end =
        Math.ceil(max / step) * step;

    const ticks = [];

    for (
        let v = start;
        v <= end + step / 2;
        v += step
    ) {
        ticks.push(
            Math.round(v * 1e6) / 1e6
        );
    }

    return ticks;
}


/**
 * Rechteck mit abgerundeter Oberkante (Datenende), eckig an der Basis.
 */
export function roundedTopRect(
    x,
    y,
    width,
    height,
    radius = 4
) {
    if (height <= 0) {
        return "";
    }

    const r =
        Math.min(
            radius,
            width / 2,
            height
        );

    return [
        `M${x},${y + height}`,
        `V${y + r}`,
        `Q${x},${y} ${x + r},${y}`,
        `H${x + width - r}`,
        `Q${x + width},${y} ${x + width},${y + r}`,
        `V${y + height}`,
        "Z",
    ].join(" ");
}


/**
 * Rechteck mit abgerundetem rechten Ende (horizontale Balken).
 */
export function roundedRightRect(
    x,
    y,
    width,
    height,
    radius = 4
) {
    if (width <= 0) {
        return "";
    }

    const r =
        Math.min(
            radius,
            height / 2,
            width
        );

    return [
        `M${x},${y}`,
        `H${x + width - r}`,
        `Q${x + width},${y} ${x + width},${y + r}`,
        `V${y + height - r}`,
        `Q${x + width},${y + height} ${x + width - r},${y + height}`,
        `H${x}`,
        "Z",
    ].join(" ");
}


/** Farben der Diagramm-Hilfslinien und Texte (aus dem App-Theme). */
export const CHART = {
    grid: "#E2E6E1",
    axis: "#68716B",
    text: "#1F2822",
    surface: "#FFFFFF",
};
