import React, {
    useMemo,
    useState,
} from "react";

import { Box } from "@mui/material";

import { ChartTooltip } from "./ChartTooltip.jsx";

import {
    CHART,
    niceTicks,
    roundedTopRect,
    useElementWidth,
} from "./chartUtils.js";


const MARGIN = {
    top: 20,
    right: 8,
    bottom: 28,
    left: 52,
};

const GAP = 2;


/**
 * Säulendiagramm, optional gestapelt.
 *
 * data:   [{ key, label, tooltipTitle?, values: { [serieKey]: number } }]
 * series: [{ key, label, color }]   – feste Reihenfolge, unten -> oben
 */
export function ColumnChart({
    data,
    series,
    height = 240,
    formatValue = value => String(value),
    formatTick = formatValue,
    ariaLabel,
}) {
    const [
        containerRef,
        width,
    ] = useElementWidth();

    const [
        active,
        setActive,
    ] = useState(null);


    const totals =
        useMemo(
            () =>
                data.map(item =>
                    series.reduce(
                        (sum, serie) =>
                            sum + (Number(item.values[serie.key]) || 0),
                        0
                    )
                ),
            [
                data,
                series,
            ]
        );


    const ticks =
        niceTicks(
            0,
            Math.max(0, ...totals)
        );

    const maxTick =
        ticks[ticks.length - 1] || 1;

    const plotWidth =
        Math.max(
            40,
            width - MARGIN.left - MARGIN.right
        );

    const plotHeight =
        height - MARGIN.top - MARGIN.bottom;

    const band =
        plotWidth / Math.max(1, data.length);

    const barWidth =
        Math.max(
            4,
            Math.min(24, band * 0.6)
        );

    const scaleY = value =>
        plotHeight - (value / maxTick) * plotHeight;

    // Beschriftungen ausdünnen, damit sie sich nicht überlappen
    const labelEvery =
        Math.max(
            1,
            Math.ceil(56 / band)
        );

    const maxIndex =
        totals.indexOf(
            Math.max(...totals)
        );


    const tooltip =
        active === null
            ? null
            : (() => {
                const item =
                    data[active];

                const rows =
                    series
                        .filter(serie =>
                            Number(item.values[serie.key]) > 0
                        )
                        .reverse()
                        .map(serie => ({
                            label: serie.label,
                            color: serie.color,
                            value: formatValue(item.values[serie.key]),
                        }));

                if (series.length > 1) {
                    rows.push({
                        label: "Gesamt",
                        value: formatValue(totals[active]),
                    });
                }

                return {
                    x: MARGIN.left + band * active + band / 2,
                    y: MARGIN.top + scaleY(totals[active]) - 10,
                    title: item.tooltipTitle ?? item.label,
                    rows: rows.length
                        ? rows
                        : [{
                            label: "",
                            value: formatValue(0),
                        }],
                };
            })();


    return (
        <Box
            ref={containerRef}
            sx={{
                position: "relative",
                width: "100%",
            }}
            onMouseLeave={() =>
                setActive(null)
            }
        >
            <svg
                width={width}
                height={height}
                role="img"
                aria-label={ariaLabel}
                style={{
                    display: "block",
                    overflow: "visible",
                }}
            >
                <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
                    {/* Hilfslinien + Achse */}
                    {ticks.map(tick => (
                        <g key={tick}>
                            <line
                                x1={0}
                                x2={plotWidth}
                                y1={scaleY(tick)}
                                y2={scaleY(tick)}
                                stroke={CHART.grid}
                                strokeWidth={1}
                            />

                            <text
                                x={-8}
                                y={scaleY(tick)}
                                dy="0.32em"
                                textAnchor="end"
                                fontSize={11}
                                fill={CHART.axis}
                            >
                                {formatTick(tick)}
                            </text>
                        </g>
                    ))}


                    {data.map((item, index) => {
                        const x =
                            band * index + (band - barWidth) / 2;

                        let offset = 0;

                        const visible =
                            series.filter(serie =>
                                Number(item.values[serie.key]) > 0
                            );

                        return (
                            <g
                                key={item.key}
                                opacity={
                                    active === null ||
                                    active === index
                                        ? 1
                                        : 0.55
                                }
                            >
                                {visible.map((serie, segmentIndex) => {
                                    const value =
                                        Number(item.values[serie.key]);

                                    const fullHeight =
                                        (value / maxTick) * plotHeight;

                                    const isTop =
                                        segmentIndex === visible.length - 1;

                                    // 2px Lücke zwischen den Segmenten
                                    const h =
                                        Math.max(
                                            0,
                                            fullHeight - (isTop ? 0 : GAP)
                                        );

                                    const y =
                                        plotHeight - offset - fullHeight;

                                    offset += fullHeight;

                                    if (h <= 0) {
                                        return null;
                                    }

                                    return isTop ? (
                                        <path
                                            key={serie.key}
                                            d={roundedTopRect(x, y, barWidth, h)}
                                            fill={serie.color}
                                        />
                                    ) : (
                                        <rect
                                            key={serie.key}
                                            x={x}
                                            y={y + GAP}
                                            width={barWidth}
                                            height={h}
                                            fill={serie.color}
                                        />
                                    );
                                })}

                                {/* Nur der Spitzenwert wird direkt beschriftet */}
                                {index === maxIndex &&
                                    totals[index] > 0 && (
                                    <text
                                        x={x + barWidth / 2}
                                        y={scaleY(totals[index]) - 6}
                                        textAnchor="middle"
                                        fontSize={11}
                                        fontWeight={600}
                                        fill={CHART.text}
                                    >
                                        {formatValue(totals[index])}
                                    </text>
                                )}

                                {index % labelEvery === 0 && (
                                    <text
                                        x={band * index + band / 2}
                                        y={plotHeight + 18}
                                        textAnchor="middle"
                                        fontSize={11}
                                        fill={CHART.axis}
                                    >
                                        {item.label}
                                    </text>
                                )}

                                {/* Trefferfläche: ganze Spalte */}
                                <rect
                                    x={band * index}
                                    y={0}
                                    width={band}
                                    height={plotHeight}
                                    fill="transparent"
                                    tabIndex={0}
                                    aria-label={`${item.tooltipTitle ?? item.label}: ${formatValue(totals[index])}`}
                                    onMouseEnter={() =>
                                        setActive(index)
                                    }
                                    onFocus={() =>
                                        setActive(index)
                                    }
                                    onBlur={() =>
                                        setActive(null)
                                    }
                                    style={{
                                        outline: "none",
                                        cursor: "default",
                                    }}
                                />
                            </g>
                        );
                    })}
                </g>
            </svg>

            {tooltip && (
                <ChartTooltip
                    {...tooltip}
                    containerWidth={width}
                />
            )}
        </Box>
    );
}
