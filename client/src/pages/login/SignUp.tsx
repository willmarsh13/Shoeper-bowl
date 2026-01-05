import React, {useEffect, useState} from "react";
import {Box, Button, Divider, Grid, IconButton, InputAdornment, Paper, TextField, Typography} from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {SignUserUp} from "./logic/SignUserUp";
import {enqueueSnackbar} from "notistack";

export default function SignUp() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [confPassword, setConfPassword] = useState('');
    const [confPasswordVisible, setConfPasswordVisible] = useState(false)

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [submitBtnEnabled, setStubmitBtnEnabled] = useState(false);

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        setLoadingSubmit(true);
        e.preventDefault()
        if (submitBtnEnabled) {
            SignUserUp(firstName, lastName, username, password)
                .then((resp) => {
                    setUsername('')
                    setPassword('')
                    setPasswordVisible(false)
                    setConfPassword('')
                    setConfPasswordVisible(false)
                    setFirstName('')
                    setLastName('')
                    enqueueSnackbar(resp?.message || "There was a server error.", {variant: resp?.variant || "error"})
                    return resp
                })
                .finally(() => {
                    setLoadingSubmit(false);
                })
        }
    }

    const handleClickShowPassword = () => setPasswordVisible((show) => !show);
    const handleClickShowConfPassword = () => setConfPasswordVisible((show) => !show);

    const handleMouseDownPassword = (event: { preventDefault: () => void; }) => {
        event.preventDefault()
    };
    const handleMouseDownConfPassword = (event: { preventDefault: () => void; }) => {
        event.preventDefault()
    };

    useEffect(() => {
        let isEnabled: boolean = false
        isEnabled = Boolean(username && password && confPassword && firstName && lastName)
        setStubmitBtnEnabled(isEnabled)
    }, [username, password, confPassword, firstName, lastName])

    return (
        <>

            <Box
                component='form'
                autoComplete="off"
                display='flex'
                justifyContent='center'
                alignItems='center'
                minHeight='100vh'
                padding='30px'
                flexDirection='column'
                sx={{backgroundColor: '#131e36'}}
            >
                <Paper elevation={24} sx={{minWidth: '50%', padding: 5}}>
                    <Typography textAlign='center' variant="h4">{`Sign up to access WHALE`}</Typography>
                    <Divider sx={{marginY: 3}}>User Information</Divider>
                    <form onSubmit={handleSubmit}>
                        <Grid container justifyContent='center' spacing={3}>
                            <Grid size={{xs: 12, md: 6}}>
                                <TextField
                                    id="firstName"
                                    label="First Name"
                                    autoComplete="cc-given-name"
                                    fullWidth
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{xs: 12, md: 6}}>
                                <TextField
                                    id="lastName"
                                    label="Last Name"
                                    autoComplete="cc-family-name"
                                    fullWidth
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </Grid>
                            <Grid size={12}>
                                <TextField
                                    id="username"
                                    label="Email"
                                    autoComplete="current-username"
                                    fullWidth
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </Grid>
                            <Grid size={12}>
                                <Divider/>
                            </Grid>
                            <Grid size={{xs: 12, md: 6}}>
                                <TextField
                                    id="password"
                                    label="Password"
                                    type={passwordVisible ? "text" : "password"}
                                    fullWidth
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="end"
                                                >
                                                    {passwordVisible ? <VisibilityOff/> : <Visibility/>}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                            <Grid size={{xs: 12, md: 6}}>
                                <TextField
                                    id="confPassword"
                                    label="Confirm Password"
                                    fullWidth
                                    type={confPasswordVisible ? "text" : "password"}
                                    value={confPassword}
                                    onChange={(e) => setConfPassword(e.target.value)}
                                    color={confPassword?.length > 0 && password?.length > 0 && confPassword !== password ? 'error' : 'primary'}
                                    aria-errormessage="Make sure passwords match."
                                    helperText={`Make sure passwords match`}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle conf password visibility"
                                                    onClick={handleClickShowConfPassword}
                                                    onMouseDown={handleMouseDownConfPassword}
                                                    edge='end'
                                                >
                                                    {confPasswordVisible ? <VisibilityOff/> : <Visibility/>}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            <Grid size={12} textAlign='center'>
                                <Button
                                    disabled={!submitBtnEnabled}
                                    sx={{marginTop: 2}}
                                    onClick={handleSubmit}
                                    variant="contained"
                                    type="submit"
                                    loading={loadingSubmit}
                                >
                                    Sign up!
                                </Button>
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="body2" margin={1} textAlign="end">
                                    <a style={{color: 'white'}} href="/shoeper-bowl/login">Return to Login</a>
                                </Typography>
                            </Grid>

                        </Grid>
                    </form>
                </Paper>
            </Box>
        </>
    )
}