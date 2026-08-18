import React from "react";

import "bootstrap/dist/css/bootstrap.min.css";

import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useApi } from "../ApiService";

import { BrotBestandTable } from "./BrotBestandTable";
import { EditBrotBestandModal } from "./EditBrotBestandModal";
import { NewBrotBestandModal } from "./NewBrotBestandModal";

import NumberFormatComponent
    from "../logic/NumberFormatComponent";


export function BrotBestandManagement() {

    // =========================================================================
    // Columns
    // =========================================================================

    const columns = React.useMemo(
        () => [
            {
                Header: "Produkt",
                accessor: "name"
            },
            {
                Header: "Gewicht in g",
                accessor: "gewicht",

                Cell: ({ value }) => (
                    <NumberFormatComponent
                        value={value}
                        includeFractionDigits={false}
                    />
                )
            },
            {
                Header: "Verfügbarkeit",
                accessor: "verfuegbarkeit"
            },
            {
                Header: "Preis in €",
                accessor: "preis",

                Cell: ({ value }) => (
                    <NumberFormatComponent
                        value={value}
                    />
                )
            }
        ],
        []
    );


    // =========================================================================
    // State
    // =========================================================================

    const [isLoading, setIsLoading] =
        React.useState(true);

    const [data, setData] =
        React.useState([]);

    const [skipPageReset, setSkipPageReset] =
        React.useState(false);

    const [reducerValue, forceUpdate] =
        React.useReducer(
            value => value + 1,
            0
        );

    const [modal, setModal] =
        React.useState({
            type: null,
            state: {}
        });


    const api = useApi();


    // =========================================================================
    // Brotbestand laden
    // =========================================================================

    React.useEffect(
        () => {

            let cancelled = false;

            setIsLoading(true);

            api.readBrotBestand()
                .then(response => {

                    if (!response.ok) {
                        throw new Error(
                            `HTTP ${response.status}`
                        );
                    }

                    return response.json();
                })
                .then(response => {

                    if (cancelled) {
                        return;
                    }

                    // Neues Backend:
                    //
                    // [
                    //   {...},
                    //   {...}
                    // ]
                    //
                    // Altes Backend / HAL:
                    //
                    // {
                    //   "_embedded": {
                    //      "brotBestandRepresentationList": [...]
                    //   }
                    // }

                    const result =
                        Array.isArray(response)
                            ? response
                            : response?._embedded
                                ?.brotBestandRepresentationList
                                ?? [];


                    console.log(
                        "[BrotBestandManagement] Brotbestand:",
                        result
                    );


                    setData(result);
                })
                .catch(error => {

                    console.error(
                        "[BrotBestandManagement] " +
                        "Brotbestand konnte nicht geladen werden:",
                        error
                    );

                    if (!cancelled) {

                        setData([]);

                        toast.error(
                            "Der Brotbestand konnte nicht geladen werden."
                        );
                    }
                })
                .finally(() => {

                    if (!cancelled) {
                        setIsLoading(false);
                    }
                });


            return () => {
                cancelled = true;
            };
        },
        [reducerValue]
    );


    // =========================================================================
    // Brotbestand bearbeiten
    // =========================================================================

    const persistBrotBestand =
        async (rowId, patch) => {

            const brotBestand =
                data[rowId];


            if (!brotBestand) {

                toast.error(
                    "Das zu bearbeitende Produkt wurde nicht gefunden."
                );

                return;
            }


            const changedData = {
                ...brotBestand
            };


            for (
                const [
                    accessor,
                    { value }
                ] of Object.entries(patch)
            ) {

                // Zahlen wirklich als Number senden

                if (
                    accessor === "preis" ||
                    accessor === "gewicht"
                ) {

                    changedData[accessor] =
                        Number(value);

                } else if (
                    accessor === "verfuegbarkeit"
                ) {

                    changedData[accessor] =
                        Boolean(value);

                } else {

                    changedData[accessor] =
                        value;
                }
            }


            changedData.type =
                "brot";


            try {

                const response =
                    await api.updateBrotBestand(
                        brotBestand.id,
                        changedData
                    );


                if (!response.ok) {

                    toast.error(
                        `Das Updaten des Produktes ` +
                        `"${brotBestand.name}" war aufgrund ` +
                        `einer fehlerhaften Eingabe nicht erfolgreich.`
                    );

                    return;
                }


                toast.success(
                    `Das Updaten des Produktes ` +
                    `"${brotBestand.name}" war erfolgreich.`
                );


                // Neu vom Backend laden
                forceUpdate();

            } catch (error) {

                console.error(
                    "Fehler beim Aktualisieren:",
                    error
                );


                toast.error(
                    `Beim Updaten des Produktes ` +
                    `"${brotBestand.name}" ist ein Fehler aufgetreten.`
                );
            }
        };


    // =========================================================================
    // Brotbestand löschen
    // =========================================================================

    const deleteBrotBestand =
        async (rowId) => {

            const brotBestand =
                data[rowId];


            if (!brotBestand) {

                toast.error(
                    "Das zu löschende Produkt wurde nicht gefunden."
                );

                return;
            }


            try {

                const response =
                    await api.deleteBrotBestand(
                        brotBestand.id
                    );


                if (!response.ok) {

                    toast.error(
                        `Das Löschen des Produktes ` +
                        `"${brotBestand.name}" war nicht erfolgreich. ` +
                        `Möglicherweise gibt es noch Bestellungen dazu.`
                    );

                    return;
                }


                setSkipPageReset(true);


                setData(current =>
                    current.filter(
                        (_, index) =>
                            index !== Number(rowId)
                    )
                );


                toast.success(
                    `Das Löschen des Produktes ` +
                    `"${brotBestand.name}" war erfolgreich.`
                );

            } catch (error) {

                console.error(
                    "Fehler beim Löschen:",
                    error
                );


                toast.error(
                    `Beim Löschen des Produktes ` +
                    `"${brotBestand.name}" ist ein Fehler aufgetreten.`
                );
            }
        };


    // =========================================================================
    // Neues Brotprodukt
    // =========================================================================

    const newBrotBestand =
        async (newData) => {

            const requestData = {

                ...newData,

                type: "brot",

                verfuegbarkeit:
                    Boolean(
                        newData.verfuegbarkeit
                    ),

                preis:
                    Number(
                        newData.preis ?? 0
                    ),

                gewicht:
                    Number(
                        newData.gewicht ?? 0
                    )
            };


            try {

                const response =
                    await api.createBrotBestand(
                        requestData
                    );


                if (!response.ok) {

                    toast.error(
                        `Das Erstellen des Produktes ` +
                        `"${requestData.name}" war nicht erfolgreich.`
                    );

                    return;
                }


                const created =
                    await response.json();


                toast.success(
                    `Das Erstellen des Produktes ` +
                    `"${requestData.name}" war erfolgreich.`
                );


                setSkipPageReset(true);


                // Direkt lokal hinzufügen

                setData(current => [
                    ...current,
                    created
                ]);


                // Hier KEIN forceUpdate nötig.
                // Sonst machen wir unmittelbar einen unnötigen
                // zusätzlichen GET-Request.

            } catch (error) {

                console.error(
                    "Fehler beim Erstellen:",
                    error
                );


                toast.error(
                    `Beim Erstellen des Produktes ` +
                    `"${requestData.name}" ist ein Fehler aufgetreten.`
                );
            }
        };


    // =========================================================================
    // Page reset
    // =========================================================================

    React.useEffect(
        () => {

            if (skipPageReset) {

                const timeout =
                    setTimeout(
                        () =>
                            setSkipPageReset(false),
                        0
                    );


                return () =>
                    clearTimeout(timeout);
            }

        },
        [data, skipPageReset]
    );


    // =========================================================================
    // Modal
    // =========================================================================

    const dispatchModal =
        (type, cell, row) => {

            let rowId;
            let values;


            if (row) {

                rowId =
                    Number(row.id);

                values =
                    row.cells;
            }


            let state = {};


            switch (type) {

                case "EditBrotBestandModal":

                    state = {
                        rowData: values,
                        rowId
                    };

                    break;


                default:

                    state = {};
            }


            setModal({
                type,
                state
            });
        };


    // =========================================================================
    // Content
    // =========================================================================

    const content = () => {

        if (isLoading) {

            return (
                <div
                    className="spinner-border"
                    role="status"
                    style={{
                        margin: "5rem"
                    }}
                >

                    <span className="sr-only">
                        Loading...
                    </span>

                </div>
            );
        }


        if (data.length === 0) {

            return (
                <div
                    style={{
                        padding: "2rem"
                    }}
                >
                    Keine Brotprodukte vorhanden.
                </div>
            );
        }


        return (
            <BrotBestandTable
                columns={columns}
                data={data}
                skipPageReset={skipPageReset}
                dispatchModal={dispatchModal}
            />
        );
    };


    // =========================================================================
    // Render
    // =========================================================================

    return (
        <div>

            <Row
                style={{
                    margin: "1rem"
                }}
            >

                <Button
                    style={{
                        margin: "0.25rem"
                    }}

                    variant="success"

                    onClick={() =>
                        dispatchModal(
                            "NewBrotBestandModal"
                        )
                    }
                >
                    Brotprodukt erstellen
                </Button>

            </Row>


            <div
                style={{
                    overflowX: "auto",
                    width: "100%"
                }}
            >
                {content()}
            </div>


            <EditBrotBestandModal
                show={
                    modal.type ===
                    "EditBrotBestandModal"
                }

                close={() =>
                    dispatchModal(null)
                }

                persist={
                    persistBrotBestand
                }

                deleteBrotBestand={
                    deleteBrotBestand
                }

                rowId={
                    modal.state.rowId
                }

                rowData={
                    modal.state.rowData
                }
            />


            <NewBrotBestandModal
                show={
                    modal.type ===
                    "NewBrotBestandModal"
                }

                close={() =>
                    dispatchModal(null)
                }

                create={
                    newBrotBestand
                }

                columns={
                    columns
                }

                {...modal.state}
            />

        </div>
    );
}