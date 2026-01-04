import React, {useEffect} from "react";
import {Box, Button, Grid, Paper, TextField, Typography} from "@mui/material";
import CheckLogin from "./logic/CheckLogin";
import {enqueueSnackbar} from "notistack";
import {getURL} from "../../Shared/getURL";

export default function LoginPage() {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false)
    const [submitBtnEnabled, setStubmitBtnEnabled] = React.useState(false);

    useEffect(() => {
        fetch(`${getURL()}/api/auth/check/`, {
            headers: {'content-type': 'application/json'},
            credentials: 'include'
        })
            .then(resp => resp.json())
            .then(data => {
                if (data.status === 200) {
                    window.location.href = "/shoeper-bowl"
                }
            })
    }, [])

    const handleFieldChange = (e: any) => {
        let trigger = e.target.id;
        let tempUsr = username
        let tempPwd = password

        switch (trigger) {
            case 'username':
                setUsername(e.target.value);
                tempUsr = e.target.value;
                break;
            case 'password':
                setPassword(e.target.value);
                tempPwd = e.target.value;
                break;
            default: //do nothing
        }

        setStubmitBtnEnabled(tempUsr.length > 0 && tempPwd.length > 0);
    }

    const handleCheckLogin = (e: any) => {
        e.preventDefault()
        setLoading(true)
        CheckLogin(username, password)
            .then((data) => {
                if (data.status === 200) {
                    window.location.href = '/shoeper-bowl'
                } else {
                    enqueueSnackbar(data.message, {variant: data?.variant || 'error'})
                    setUsername('')
                    setPassword('')
                }
            })
            .finally(() => {
                setLoading(false)
            })
    }

    return (
        <>

            <Box
                display='flex'
                justifyContent='center'
                alignItems='center'
                minHeight='100vh'
                padding='30px'
                flexDirection='column'
                sx={{backgroundImage: '', backgroundColor: '#131e36'}}
            >
                <Paper elevation={24} sx={{
                    marginBottom: '5%',
                    backgroundColor: 'gray',
                    textAlign: 'center',
                    minWidth: '50%',
                    padding: 5
                }}>
                    <Grid container justifyContent='space-around'>
                        <Grid size={{xs: 12, md: 8, lg: 10}}>
                            <Typography variant='h2' color='black'>
                                Welcome!
                            </Typography>
                            <Typography variant='body1' color='black'>
                                Please log in to access Shoe-per-bowl
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
                <Paper elevation={24} sx={{minWidth: '50%'}}>
                    <form onSubmit={handleCheckLogin}>
                        <Grid container justifyContent='center' spacing={3} padding={5}>
                            <Grid size={12}>
                                <TextField
                                    id="username"
                                    label="Email"
                                    autoComplete="current-username"
                                    fullWidth
                                    value={username}
                                    onChange={handleFieldChange}
                                />
                            </Grid>
                            <Grid size={12}>
                                <TextField
                                    id="password"
                                    label="Password"
                                    type="password"
                                    autoComplete="current-password"
                                    fullWidth
                                    value={password}
                                    onChange={handleFieldChange}
                                />
                            </Grid>

                            <Grid size={12} textAlign='center'>
                                <Button
                                    disabled={!submitBtnEnabled}
                                    sx={{marginTop: 2}}
                                    onClick={handleCheckLogin}
                                    variant="contained"
                                    type="submit"
                                    loading={loading}
                                >
                                    Sign in!
                                </Button>
                            </Grid>

                            <Grid size={6}>
                                <Typography variant="body2" margin={1}>
                                    <a style={{color: 'white'}} href="/shoeper-bowl/ForgotPW">Forgot
                                        password?</a>
                                </Typography>
                            </Grid>
                            <Grid size={6}>
                                <Typography variant="body2" margin={1} textAlign="end">
                                    <a style={{color: 'white'}} href="/shoeper-bowl/SignUp">New User? Sign-up!</a>
                                </Typography>
                            </Grid>

                        </Grid>
                    </form>
                </Paper>
            </Box>
        </>
    )
}