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

                backgroundImage: 'url(/shoeper-bowl/assets/images/CLE_PIT_PRESTON.JPEG)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',

                // Optional: subtle overlay for text readability
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.45)',
                    zIndex: 0,
                },
            })}
        >
            <Container maxWidth="sm" sx={{position: 'relative', zIndex: 1}}>
                <Stack
                    spacing={4}
                    alignItems="center"
                    textAlign="center"
                >
                    <Stack spacing={0} alignItems='center' textAlign='center'>
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
                            Build your ultimate postseason fantasy roster.
                        </Typography>
                    </Stack>
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
                            href="/shoeper-bowl/buildTeam"
                        >
                            Build My Team
                        </Button>

                        <Button
                            size="small"
                            variant="text"
                            color="inherit"
                            href="/shoeper-bowl/profile"
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
