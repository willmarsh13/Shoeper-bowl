import {Grid, Container} from "@mui/material";
import React from "react";
import AccountReqs from "./components/AccountReqs";
import Accounts from "./components/Accounts";

export default function Admin() {
    return (
        <Container maxWidth='lg' sx={{paddingTop: 3}}>
            <Grid
                container
                spacing={3}
                justifyContent="center"
            >
                {/* Account Requests */}
                <Grid size={{xs: 12, md: 5, lg: 4}}>
                    <AccountReqs/>
                </Grid>

                {/* Approved / Existing Accounts */}
                <Grid size={{xs: 12, md: 7, lg: 8}}>
                    <Accounts/>
                </Grid>
            </Grid>
        </Container>
    );
}
