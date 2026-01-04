import {Grid} from "@mui/material";
import React from "react";
import AccountReqs from "./components/AccountReqs";

export default function Admin() {

    return (
        <>
            <div style={{display: 'grid', paddingTop: 20}}>
                <Grid container spacing={3} size={{xs: 12, lg: 12}} justifySelf="center">
                    <Grid size={{xs: 12}}>
                        <AccountReqs/>
                    </Grid>
                </Grid>
            </div>
        </>
    )
}