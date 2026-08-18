import React from "react";

import {
    useExpanded,
    useSortBy,
    useTable
} from "react-table";

import BTable from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";

import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ClickAwayListener from "@mui/material/ClickAwayListener";

import CustomTooltip from "../components/CustomToolTip";

import "../Table.css";


export function BrotTable({
    columns,
    data = [],
    skipPageReset = false
}) {

    const NOT_AVAILABLE_COLOR =
        "#D3D3D3";


    // =========================================================================
    // React Table
    // =========================================================================

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow
    } = useTable(
        {
            columns,
            data,

            getSubRows: row =>
                Array.isArray(row.produkte)
                    ? row.produkte
                    : [],

            autoResetPage:
                !skipPageReset,

            autoResetExpanded:
                !skipPageReset
        },

        useSortBy,
        useExpanded
    );


    // =========================================================================
    // Preis berechnen
    // =========================================================================

    const calculatePrice = () => {

        let totalPrice = 0;


        for (
            let i = 0;
            i < data.length;
            i++
        ) {

            const input =
                document.getElementById(
                    `Inputfield${i}`
                );


            const priceElement =
                document.getElementById(
                    `PreisId${i}`
                );


            if (
                !input ||
                !priceElement
            ) {
                continue;
            }


            const amount =
                Number(input.value || 0);


            const price =
                Number(
                    priceElement
                        .innerText
                        .replace(",", ".")
                        .replace(/[^\d.-]/g, "")
                );


            if (
                Number.isNaN(amount) ||
                Number.isNaN(price)
            ) {
                continue;
            }


            totalPrice +=
                price * amount;
        }


        const priceOutput =
            document.getElementById(
                "preis"
            );


        if (priceOutput) {

            priceOutput.innerHTML =
                "Preis: " +
                totalPrice
                    .toFixed(2)
                    .replace(".", ",") +
                " €";
        }
    };


    // =========================================================================
    // Werte aus der Vorwoche übernehmen
    // =========================================================================

    const setValuesToBestellungVorwoche =
        () => {

            for (
                let i = 0;
                i < data.length;
                i++
            ) {

                const input =
                    document.getElementById(
                        `Inputfield${i}`
                    );


                if (!input) {
                    continue;
                }


                let bestellmenge =
                    data[i]?.bestellmengeAlt;


                if (
                    bestellmenge === null ||
                    bestellmenge === undefined
                ) {

                    bestellmenge = "";
                }


                input.value =
                    bestellmenge;
            }


            calculatePrice();
        };


    // =========================================================================
    // Tooltip
    // =========================================================================

    const [open, setOpen] =
        React.useState(false);


    const handleTooltipClose = () => {
        setOpen(false);
    };


    const handleTooltipOpen = () => {
        setOpen(true);
    };


    // =========================================================================
    // Render
    // =========================================================================

    return (
        <div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px"
                }}
            >

                <ClickAwayListener
                    onClickAway={
                        handleTooltipClose
                    }
                >

                    <div>

                        <CustomTooltip
                            onClose={
                                handleTooltipClose
                            }

                            open={open}

                            disableFocusListener
                            disableHoverListener
                            disableTouchListener

                            title={
                                <React.Fragment>

                                    <Typography
                                        color="inherit"
                                    >
                                        <b>
                                            Hinweis
                                        </b>
                                    </Typography>

                                    Über
                                    {" "}
                                    <b>
                                        „Bestellmenge Vorwoche laden“
                                    </b>
                                    {" "}
                                    können Sie die
                                    Bestellmengen Ihrer
                                    Bestellung aus der
                                    Vorwoche in die
                                    Eingabefelder
                                    „Bestellmenge“ laden.

                                </React.Fragment>
                            }

                            placement="right"

                            arrow
                        >

                            <IconButton
                                style={{
                                    margin:
                                        "0.5em 0 0.5em 0"
                                }}

                                onClick={
                                    handleTooltipOpen
                                }
                            >

                                <HelpOutlineIcon />

                            </IconButton>

                        </CustomTooltip>

                    </div>

                </ClickAwayListener>


                <Button
                    style={{
                        margin:
                            "0.5em 1em 0.5em 0"
                    }}

                    variant="primary"

                    onClick={
                        setValuesToBestellungVorwoche
                    }
                >

                    Bestellmenge Vorwoche laden

                </Button>

            </div>


            <div className="tableFixHead">

                <BTable
                    striped
                    bordered
                    hover
                    size="sm"

                    {...getTableProps()}
                >

                    <thead>

                        {
                            headerGroups.map(
                                headerGroup => (

                                    <tr
                                        {...headerGroup
                                            .getHeaderGroupProps()}
                                    >

                                        {
                                            headerGroup.headers
                                                .map(
                                                    column => {

                                                        if (
                                                            column.Header ===
                                                            "BrotID"
                                                        ) {
                                                            return null;
                                                        }


                                                        return (
                                                            <th
                                                                className="word-wrap"

                                                                {...column
                                                                    .getHeaderProps(
                                                                        column
                                                                            .getSortByToggleProps()
                                                                    )}
                                                            >

                                                                {
                                                                    column.render(
                                                                        "Header"
                                                                    )
                                                                }


                                                                <span>

                                                                    {
                                                                        column.isSorted
                                                                            ? (
                                                                                column.isSortedDesc
                                                                                    ? " ↓"
                                                                                    : " ↑"
                                                                            )
                                                                            : ""
                                                                    }

                                                                </span>

                                                            </th>
                                                        );
                                                    }
                                                )
                                        }

                                    </tr>
                                )
                            )
                        }

                    </thead>


                    <tbody
                        {...getTableBodyProps()}
                    >

                        {
                            rows.map(
                                row => {

                                    prepareRow(row);


                                    const rowData =
                                        row.original;


                                    const cells =
                                        rowData.hasOwnProperty(
                                            "produkte"
                                        )
                                            ? row.cells.slice(
                                                0,
                                                2
                                            )
                                            : row.cells;


                                    return (

                                        <tr
                                            {...row.getRowProps()}
                                        >

                                            {
                                                cells.map(
                                                    cell => {

                                                        if (
                                                            cell.column.Header ===
                                                            "BrotID"
                                                        ) {
                                                            return null;
                                                        }


                                                        const props =
                                                            cell.getCellProps();


                                                        // ---------------------------------------------------------
                                                        // Eingabefeld Bestellmenge
                                                        // ---------------------------------------------------------

                                                        if (
                                                            cell.column.Header ===
                                                            "Bestellmenge"
                                                        ) {

                                                            const vorwoche =
                                                                rowData
                                                                    .bestellmengeAlt ??
                                                                0;


                                                            const id =
                                                                `Inputfield${row.index}`;


                                                            return (

                                                                <td
                                                                    className="word-wrap"

                                                                    {...props}
                                                                >

                                                                    <input
                                                                        placeholder={
                                                                            `Vorwoche: ${vorwoche}`
                                                                        }

                                                                        className="brotbestellung-inputfield-size"

                                                                        type="number"

                                                                        min="0"

                                                                        step="1"

                                                                        id={id}

                                                                        onChange={
                                                                            calculatePrice
                                                                        }

                                                                        disabled={
                                                                            rowData
                                                                                .verfuegbarkeit ===
                                                                            false
                                                                        }
                                                                    />

                                                                </td>
                                                            );
                                                        }


                                                        // ---------------------------------------------------------
                                                        // Preis
                                                        // ---------------------------------------------------------

                                                        if (
                                                            cell.column.Header ===
                                                            "Preis in €"
                                                        ) {

                                                            const id =
                                                                `PreisId${row.index}`;


                                                            return (

                                                                <td
                                                                    className="word-wrap"

                                                                    style={{
                                                                        color:
                                                                            rowData
                                                                                .verfuegbarkeit ===
                                                                            false
                                                                                ? NOT_AVAILABLE_COLOR
                                                                                : ""
                                                                    }}

                                                                    {...props}

                                                                    id={id}
                                                                >

                                                                    {
                                                                        cell.render(
                                                                            "Cell"
                                                                        )
                                                                    }

                                                                </td>
                                                            );
                                                        }


                                                        // ---------------------------------------------------------
                                                        // Mengen / Gewicht
                                                        // ---------------------------------------------------------

                                                        if (
                                                            cell.column.Header ===
                                                                "aktuelle Bestellmenge" ||
                                                            cell.column.Header ===
                                                                "Gewicht in g"
                                                        ) {

                                                            return (

                                                                <td
                                                                    className="word-wrap"

                                                                    style={{
                                                                        color:
                                                                            rowData
                                                                                .verfuegbarkeit ===
                                                                            false
                                                                                ? NOT_AVAILABLE_COLOR
                                                                                : ""
                                                                    }}

                                                                    {...props}
                                                                >

                                                                    {
                                                                        cell.render(
                                                                            "Cell"
                                                                        )
                                                                    }

                                                                </td>
                                                            );
                                                        }


                                                        // ---------------------------------------------------------
                                                        // Standardzelle
                                                        // ---------------------------------------------------------

                                                        return (

                                                            <td
                                                                className="word-wrap"

                                                                style={{
                                                                    color:
                                                                        rowData
                                                                            .verfuegbarkeit ===
                                                                        false
                                                                            ? NOT_AVAILABLE_COLOR
                                                                            : ""
                                                                }}

                                                                {...props}
                                                            >

                                                                {
                                                                    cell.render(
                                                                        "Cell"
                                                                    )
                                                                }

                                                            </td>
                                                        );
                                                    }
                                                )
                                            }

                                        </tr>
                                    );
                                }
                            )
                        }

                    </tbody>

                </BTable>

            </div>

        </div>
    );
}