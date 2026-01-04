import React from 'react';
import {Box, Button, Container, Stack, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';

const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={theme => ({
                minHeight: `calc(100vh - ${theme.mixins.toolbar.minHeight}px - 15px)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `
                        radial-gradient(
                            circle at top,
                            ${theme.palette.primary.light}22,
                            ${theme.palette.background.default} 60%
                        )
                    `,
            })}
        >
            <Container maxWidth="sm">
                <Stack
                    spacing={4}
                    alignItems="center"
                    textAlign="center"
                >
                    {/* App Name */}
                    <Typography
                        variant="h2"
                        fontWeight={800}
                        sx={{letterSpacing: -1}}
                    >
                        Shoe-per Bowl
                    </Typography>

                    {/* Tagline */}
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{maxWidth: 420}}
                    >
                        Build your ultimate postseason fantasy roster and
                        ride it all the way to the championship.
                    </Typography>

                    {/* CTA Buttons */}
                    <Stack spacing={1.5} width="100%" alignItems="center">
                        <Button
                            size="large"
                            variant="contained"
                            sx={{
                                px: 6,
                                py: 1.5,
                                fontSize: '1rem',
                                borderRadius: 3,
                            }}
                            onClick={() => navigate('/buildTeam')}
                        >
                            Build My Team
                        </Button>

                        <Button
                            size="small"
                            variant="text"
                            color="inherit"
                            onClick={() => navigate('/profile')}
                        >
                            View My Picks
                        </Button>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
};

export default Home;
