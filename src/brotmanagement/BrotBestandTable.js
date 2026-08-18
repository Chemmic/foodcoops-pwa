import React from "react";
import { useExpanded, useTable, useSortBy } from "react-table";
import BTable from "react-bootstrap/Table";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CustomTooltip from "../components/CustomToolTip";
import "../Table.css";

const ALLERGEN_LABELS = {
    eier: "Eier",
    milch: "Milch",
    sesam: "Sesam",
    schalenfruechte: "Schalenfrüchte",
    sellerie: "Sellerie",
    soja: "Soja",
};

function formatGetreideName(value) {
    if (!value || typeof value !== "string") {
        return "";
    }

    return value
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}

function getVisibleAllergenEntries(allergenInfo) {
    if (!allergenInfo) {
        return [];
    }

    const entries = [];

    if (Array.isArray(allergenInfo.getreide) && allergenInfo.getreide.length > 0) {
        entries.push({
            label: "Getreide",
            value: allergenInfo.getreide.map(formatGetreideName).join(", ")
        });
    }

    Object.entries(ALLERGEN_LABELS).forEach(([key, label]) => {
        if (allergenInfo[key] === true) {
            entries.push({
                label,
                value: null
            });
        }
    });

    if (
        typeof allergenInfo.hinweis === "string" &&
        allergenInfo.hinweis.trim() !== ""
    ) {
        entries.push({
            label: "Hinweis",
            value: allergenInfo.hinweis.trim()
        });
    }

    return entries;
}

function hasRelevantAllergenInfo(allergenInfo) {
    return getVisibleAllergenEntries(allergenInfo).length > 0;
}

function AllergenInfoIcon({ allergenInfo }) {
    const [open, setOpen] = React.useState(false);

    const entries = getVisibleAllergenEntries(allergenInfo);

    if (entries.length === 0) {
        return null;
    }

    return (
        <ClickAwayListener onClickAway={() => setOpen(false)}>
            <span style={{ display: "inline-flex", alignItems: "center", marginLeft: "0.35rem" }}>
                <CustomTooltip
                    open={open}
                    onClose={() => setOpen(false)}
                    onOpen={() => setOpen(true)}
                    arrow
                    placement="right"
                    title={
                        <React.Fragment>
                            <Typography color="inherit">
                                <b>Allergeninfo</b>
                            </Typography>

                            <ul style={{ margin: "0.5rem 0 0 1rem", padding: 0 }}>
                                {entries.map((entry, index) => (
                                    <li key={`${entry.label}-${index}`}>
                                        {entry.value
                                            ? `${entry.label}: ${entry.value}`
                                            : entry.label}
                                    </li>
                                ))}
                            </ul>
                        </React.Fragment>
                    }
                >
                    <IconButton
                        size="small"
                        onClick={(event) => {
                            event.stopPropagation();
                            setOpen(prev => !prev);
                        }}
                    >
                        <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                </CustomTooltip>
            </span>
        </ClickAwayListener>
    );
}

export function BrotBestandTable({ columns, data, skipPageReset, dispatchModal }) {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable(
        {
            columns,
            data,
            getSubRows: row => row.produkte,
            autoResetPage: !skipPageReset,
            autoResetExpanded: !skipPageReset,
        },
        useSortBy,
        useExpanded,
    );

    return (
        <div className="tableFixHead tFH-management">
            <BTable striped bordered hover size="sm" {...getTableProps()}>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th
                                    className="word-wrap"
                                    {...column.getHeaderProps(column.getSortByToggleProps())}
                                >
                                    {column.render("Header")}
                                    <span>
                                        {column.isSorted ? (column.isSortedDesc ? " ↓" : " ↑") : ""}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>

                <tbody {...getTableBodyProps()}>
                    {rows.map(row => {
                        prepareRow(row);

                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map((cell) => {
                                    const props = cell.getCellProps();

                                    props.onClick = () =>
                                        dispatchModal("EditBrotBestandModal", cell, row);

                                    props.style = {
                                        ...props.style,
                                        cursor: "pointer"
                                    };

                                    if (cell.column.id === "name") {
                                        return (
                                            <td className="word-wrap" {...props}>
                                                <span
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center"
                                                    }}
                                                >
                                                    {cell.render("Cell")}

                                                    {hasRelevantAllergenInfo(row.original.allergenInfo) && (
                                                        <AllergenInfoIcon
                                                            allergenInfo={row.original.allergenInfo}
                                                        />
                                                    )}
                                                </span>
                                            </td>
                                        );
                                    }

                                    return (
                                        <td className="word-wrap" {...props}>
                                            {cell.column.id === "verfuegbarkeit"
                                                ? (cell.value ? "Ja" : "Nein")
                                                : cell.render("Cell")}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </BTable>
        </div>
    );
}