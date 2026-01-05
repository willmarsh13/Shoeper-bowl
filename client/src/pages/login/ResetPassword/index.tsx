import {useEffect, useState, FormEvent, JSX} from "react";
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

interface ResetPasswordResponse {
    status?: number;
    message?: string;
}

const ResetPassword = (): JSX.Element => {
    const [token, setToken] = useState<string | null>(null);
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const t = params.get("token");

        if (!t) {
            setError("Invalid or missing reset token.");
        } else {
            setToken(t);
        }
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${getURL()}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    newPassword: password,
                }),
                credentials: 'include',
            });

            const data: ResetPasswordResponse = await res.json();

            if (!res.ok || data.status !== 200) {
                throw new Error(data.message || "Reset failed");
            }

            setSuccess(true);

            setTimeout(() => {
                window.location.href = "/shoeper-bowl/login";
            }, 2000);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Invalid or expired reset link.");
            }
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
            <Paper elevation={4} sx={{ p: 4, width: 420 }}>
                {success ? (
                    <>
                        <Typography variant="h5" gutterBottom>
                            Password Reset
                        </Typography>
                        <Typography variant="body1">
                            Your password has been reset. Redirecting to login…
                        </Typography>
                    </>
                ) : (
                    <>
                        <Typography variant="h5" gutterBottom>
                            Reset Password
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                label="New Password"
                                type="password"
                                fullWidth
                                required
                                margin="normal"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <TextField
                                label="Confirm Password"
                                type="password"
                                fullWidth
                                required
                                margin="normal"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                            />

                            {error && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3 }}
                                disabled={loading || !token}
                            >
                                {loading ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </Box>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default ResetPassword;
