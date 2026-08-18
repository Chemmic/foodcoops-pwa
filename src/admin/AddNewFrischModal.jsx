import React, {
    useMemo,
    useState,
} from "react";

import {
    Autocomplete,
    Button,
    Stack,
    TextField,
} from "@mui/material";

import AddOutlinedIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

import { toast } from "react-toastify";

import { LagerModal } from "../lager/LagerModal.jsx";
import { useApi } from "../ApiService.jsx";


export function AddNewFrischModal(
    props
) {
    const api = useApi();

    const [
        selectedProduct,
        setSelectedProduct,
    ] = useState(null);

    const [
        amount,
        setAmount,
    ] = useState("");


    const options =
        useMemo(
            () =>
                props.frischBestandForModal.filter(
                    product =>
                        !props.discrepancyForModal.some(
                            discrepancy =>
                                discrepancy
                                    ?.bestand
                                    ?.name ===
                                    product.name &&
                                Number(
                                    discrepancy.zuVielzuWenig
                                ) !== 0
                        )
                ),
            [
                props.frischBestandForModal,
                props.discrepancyForModal,
            ]
        );


    const close = () => {
        setSelectedProduct(
            null
        );

        setAmount("");

        props.close();
    };


    const save = async () => {
        if (
            !selectedProduct ||
            amount === ""
        ) {
            toast.error(
                "Bitte fülle alle Felder aus."
            );

            return;
        }


        try {
            const existing =
                props.discrepancyForModal.find(
                    item =>
                        item?.bestand
                            ?.name ===
                        selectedProduct.name
                );


            let response;


            if (existing) {
                response =
                    await api.updateDiscrepancy(
                        existing.id,
                        amount
                    );
            } else {
                const discrepancy = {
                    bestand: {
                        ...selectedProduct,
                        type:
                            "frisch",
                    },

                    gewollteMenge:
                        0,

                    zuBestellendeGebinde:
                        0,

                    zuVielzuWenig:
                        Number(
                            amount
                        ),
                };


                response =
                    await api.addDiscrepancyToLastOrderList(
                        discrepancy
                    );
            }


            if (!response.ok) {
                toast.error(
                    "Das Produkt konnte nicht zur Liste hinzugefügt werden."
                );

                return;
            }


            toast.success(
                `${selectedProduct.name} wurde erfolgreich zur Liste hinzugefügt.`
            );


            props.updateParent();

            close();
        } catch (error) {
            console.error(
                "Fehler beim Hinzufügen des Produktes:",
                error
            );

            toast.error(
                "Beim Hinzufügen des Produktes ist ein Fehler aufgetreten."
            );
        }
    };


    const body = (
        <Stack spacing={2.5}>
            <Autocomplete
                options={options}
                value={
                    selectedProduct
                }
                getOptionLabel={
                    option =>
                        option?.name ??
                        ""
                }
                isOptionEqualToValue={(
                    option,
                    value
                ) =>
                    option.id ===
                    value.id
                }
                onChange={(
                    event,
                    value
                ) =>
                    setSelectedProduct(
                        value
                    )
                }
                renderInput={
                    params => (
                        <TextField
                            {...params}
                            label="Produkt"
                            placeholder="Produkt auswählen"
                        />
                    )
                }
            />

            <TextField
                fullWidth
                label="Zu viel / zu wenig"
                type="number"
                value={amount}
                onChange={event =>
                    setAmount(
                        event.target
                            .value
                    )
                }
                helperText="Negative Werte bedeuten zu wenig geliefert."
            />
        </Stack>
    );


    const footer = (
        <>
            <Button
                variant="outlined"
                startIcon={
                    <CloseIcon />
                }
                onClick={close}
            >
                Zurück
            </Button>

            <Button
                variant="contained"
                startIcon={
                    <AddOutlinedIcon />
                }
                onClick={save}
                disabled={
                    !selectedProduct ||
                    amount === ""
                }
            >
                Produkt hinzufügen
            </Button>
        </>
    );


    return (
        <LagerModal
            title="Produkt hinzufügen"
            body={body}
            footer={footer}
            show={props.show}
            hide={close}
            parentProps={props}
        />
    );
}