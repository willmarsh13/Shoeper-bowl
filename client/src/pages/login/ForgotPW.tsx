import React from "react";
import {Box, Divider, Grid, Paper, Typography} from "@mui/material";

export default function ForgotPW() {

    return (
        <>
            <Box
                component='form'
                autoComplete="off"
                display='flex'
                justifyContent='center'
                alignItems='center'
                minHeight='100vh'
                flexDirection='column'
                sx={{backgroundImage: '', backgroundColor: '#131e36'}}
            >
                <Paper elevation={24} sx={{minWidth: '50%', padding: '30px'}}>
                    <Grid container>
                        <Grid size={12}>
                            <Typography variant="h4" textAlign='center'> To reset your password, contact Will or
                                Ashlyn</Typography>
                        </Grid>
                        <Grid size={12} marginY={2}>
                            <Divider/>
                        </Grid>
                        <Grid size={12}>
                            <Typography variant="body2" margin={1} textAlign='center'>
                                <a style={{color: 'white'}} href="/login">Return to Login</a>
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </>
    )
}