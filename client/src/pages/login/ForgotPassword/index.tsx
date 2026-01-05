import {useState, FormEvent, JSX} from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    CircularProgress,
    Alert,
    Paper,
} from "@mui/material";
import React from "react";
import {getURL} from "../../../Shared/getURL";

interface ForgotPasswordResponse {
    status?: number;
    message?: string;
}

const ForgotPassword = (): JSX.Element => {
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${getURL()}/api/auth/forgot-password`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email}),
                credentials: 'include',
            });

            const _data: ForgotPasswordResponse = await res.json();
            setSubmitted(true);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            minHeight="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            <Paper elevation={4} sx={{p: 4, width: 420}}>
                {submitted ? (
                    <>
                        <Typography variant="h5" gutterBottom>
                            Check your email
                        </Typography>
                        <Typography variant="body1">
                            If an account exists for that email, a password reset
                            link has been sent.
                        </Typography>
                    </>
                ) : (
                    <>
                        <Typography variant="h5" gutterBottom>
                            Forgot Password
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                label="Email"
                                type="email"
                                fullWidth
                                required
                                margin="normal"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            {error && (
                                <Alert severity="error" sx={{mt: 2}}>
                                    {error}
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{mt: 3}}
                                disabled={loading}
                            >
                                {loading ? (
                                    <CircularProgress size={24}/>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>
                        </Box>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default ForgotPassword;
