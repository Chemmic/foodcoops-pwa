import React from "react";

import Tooltip, {
    tooltipClasses,
} from "@mui/material/Tooltip";

import { styled } from "@mui/material/styles";


const CustomToolTip = styled(
    ({
        className,
        ...props
    }) => (
        <Tooltip
            {...props}
            classes={{
                popper: className,
            }}
            arrow
        />
    )
)(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        maxWidth: 320,

        padding:
            theme.spacing(1.25, 1.5),

        backgroundColor:
            theme.palette.background.paper,

        color:
            theme.palette.text.primary,

        border: `1px solid ${theme.palette.divider}`,

        borderRadius:
            theme.shape.borderRadius,

        boxShadow:
            theme.shadows[4],

        fontSize:
            theme.typography.pxToRem(
                13
            ),

        lineHeight: 1.5,
    },

    [`& .${tooltipClasses.arrow}`]: {
        color:
            theme.palette.background.paper,

        "&::before": {
            border: `1px solid ${theme.palette.divider}`,
        },
    },
}));


export default CustomToolTip;