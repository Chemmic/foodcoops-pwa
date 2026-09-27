import React, {
    useMemo,
    useState,
} from "react";

import { Box } from "@mui/material";

import { ChartTooltip } from "./ChartTooltip.jsx";

import {
    CHART,
    niceTicks,
    useElementWidth,
} from "./chartUtils.js";


const MARGIN = {
    top: 16,
    right: 16,
    bottom: 28,
    left: 52,
};


/**
 * Liniendiagramm mit Fadenkreuz: Der Tooltip zeigt alle Serien am
 * nächstgelegenen Zeitpunkt.
 *
 * series: [{ key, label, color, points: [{ x: Date|string, y: number, tooltip?: string }] }]
 */
export function LineChart({
    series,
    height = 240,
    formatValue = value => String(value),
    formatTick = formatValue,
    formatX = value => String(value),
    baseline = null,
    ariaLabel,
}) {
    const [
        containerRef,
        width,
    ] = useElementWidth();

    const [
        activeX,
        setActiveX,
    ] = useState(null);


    const prepared =
        useMemo(
            () =>
                series.map(serie => ({
                    ...serie,
                    points: serie.points
                        .map(point => ({
                            ...point,
                            t: new Date(point.x).getTime(),
                        }))
                        .filter(point =>
                            Number.isFinite(point.t) &&
                            Number.isFinite(point.y)
                        )
                        .sort((a, b) => a.t - b.t),
                })),
            [series]
        );

    const xs =
        useMemo(
            () =>
                [...new Set(
                    prepared.flatMap(serie =>
                        serie.points.map(point => point.t)
                    )
                )].sort((a, b) => a - b),
            [prepared]
        );

    const ys =
        prepared.flatMap(serie =>
            serie.points.map(point => point.y)
        );

    if (baseline !== null) {
        ys.push(baseline);
    }

    const ticks =
        niceTicks(
            Math.min(...ys),
            Math.max(...ys)
        );

    const minY = ticks[0];
    const maxY = ticks[ticks.length - 1];

    const plotWidth =
        Math.max(
            40,
            width - MARGIN.left - MARGIN.right
        );

    const plotHeight =
        height - MARGIN.top - MARGIN.bottom;

    const minX = xs[0] ?? 0;
    const maxX = xs[xs.length - 1] ?? 1;

    const scaleX = t =>
        maxX === minX
            ? plotWidth / 2
            : ((t - minX) / (maxX - minX)) * plotWidth;

    const scaleY = value =>
        maxY === minY
            ? plotHeight / 2
            : plotHeight - ((value - minY) / (maxY - minY)) * plotHeight;


    // x-Beschriftungen: höchstens alle ~70px eine
    const labelCount =
        Math.max(
            2,
            Math.floor(plotWidth / 70)
        );

    const labelEvery =
        Math.max(
            1,
            Math.ceil(xs.length / labelCount)
        );


    const handleMove = event => {
        if (!xs.length) {
            return;
        }

        const rect =
            event.currentTarget.getBoundingClientRect();

        const px =
            event.clientX - rect.left - MARGIN.left;

        let nearest = xs[0];

        for (const t of xs) {
            if (
                Math.abs(scaleX(t) - px) <
                Math.abs(scaleX(nearest) - px)
            ) {
                nearest = t;
            }
        }

        setActiveX(nearest);
    };


    const tooltip =
        activeX === null
            ? null
            : {
                x: MARGIN.left + scaleX(activeX),
                y: MARGIN.top,
                title: formatX(new Date(activeX)),
                rows: prepared
                    .map(serie => {
                        const point =
                            serie.points.find(p => p.t === activeX);

                        return point
                            ? {
                                label: serie.label,
                                color: serie.color,
                                value: point.tooltip ?? formatValue(point.y),
                            }
                            : null;
                    })
                    .filter(Boolean),
            };


    return (
        <Box
            ref={containerRef}
            sx={{
                position: "relative",
                width: "100%",
            }}
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
                onMouseMove={handleMove}
                onMouseLeave={() =>
                    setActiveX(null)
                }
            >
                <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
                    {ticks.map(tick => (
                        <g key={tick}>
                            <line
                                x1={0}
                                x2={plotWidth}
                                y1={scaleY(tick)}
                                y2={scaleY(tick)}
                                stroke={CHART.grid}
                                strokeWidth={
                                    tick === baseline
                                        ? 1.5
                                        : 1
                                }
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


                    {xs.map((t, index) =>
                        index % labelEvery === 0 ? (
                            <text
                                key={t}
                                x={scaleX(t)}
                                y={plotHeight + 18}
                                textAnchor="middle"
                                fontSize={11}
                                fill={CHART.axis}
                            >
                                {formatX(new Date(t))}
                            </text>
                        ) : null
                    )}


                    {activeX !== null && (
                        <line
                            x1={scaleX(activeX)}
                            x2={scaleX(activeX)}
                            y1={0}
                            y2={plotHeight}
                            stroke={CHART.axis}
                            strokeWidth={1}
                        />
                    )}


                    {prepared.map(serie => {
                        if (!serie.points.length) {
                            return null;
                        }

                        const path =
                            serie.points
                                .map((point, index) =>
                                    `${index === 0 ? "M" : "L"}${scaleX(point.t)},${scaleY(point.y)}`
                                )
                                .join(" ");

                        const last =
                            serie.points[serie.points.length - 1];

                        const hovered =
                            activeX === null
                                ? null
                                : serie.points.find(p => p.t === activeX);

                        return (
                            <g key={serie.key}>
                                <path
                                    d={path}
                                    fill="none"
                                    stroke={serie.color}
                                    strokeWidth={2}
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                />

                                {[hovered ?? last].map(point => (
                                    <circle
                                        key="marker"
                                        cx={scaleX(point.t)}
                                        cy={scaleY(point.y)}
                                        r={4}
                                        fill={serie.color}
                                        stroke={CHART.surface}
                                        strokeWidth={2}
                                    />
                                ))}
                            </g>
                        );
                    })}


                    {/* Trefferfläche für das Fadenkreuz */}
                    <rect
                        x={0}
                        y={0}
                        width={plotWidth}
                        height={plotHeight}
                        fill="transparent"
                    />
                </g>
            </svg>

            {tooltip &&
                tooltip.rows.length > 0 && (
                <ChartTooltip
                    {...tooltip}
                    containerWidth={width}
                />
            )}
        </Box>
    );
}
