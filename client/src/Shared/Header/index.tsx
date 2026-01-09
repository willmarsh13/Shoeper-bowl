import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import {pages} from "../../App";
import {AccountInfo, Setting} from "../../Interfaces/App";
import {Avatar, Tooltip} from "@mui/material";
import logout from "../logout";
import {useDispatch} from "react-redux";
import {useEffect} from "react";
import {setHeaderHeight} from "../../redux/reducers/appReducer";


interface HeaderProps {
    settings: Setting[],
    userInfo: AccountInfo,
}

export default function Header({settings, userInfo}: HeaderProps) {
    const [profileAnchor, setProfileAnchor] = React.useState<null | HTMLElement>(null);
    const [profileOpen, setProfileOpen] = React.useState<null | HTMLElement>(null);
    const headerRef = React.useRef<HTMLDivElement>(null);
    const dispatch = useDispatch()

    useEffect(() => {
        if (!headerRef.current) return;

        const updateHeight = () => {
            dispatch(setHeaderHeight(headerRef.current!.offsetHeight));
        };

        // Initial height
        updateHeight();

        // Observe changes in size
        const observer = new ResizeObserver(() => {
            updateHeight();
        });

        observer.observe(headerRef.current);

        return () => observer.disconnect();
    }, [headerRef, dispatch]);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setProfileAnchor(event.currentTarget);
    };

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setProfileOpen(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setProfileAnchor(null);
    };

    const handleCloseUserMenu = () => {
        setProfileOpen(null);
    };

    return (
        <AppBar position="static" ref={headerRef}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <SportsFootballIcon sx={{display: {xs: 'none', md: 'flex'}, mr: 1}}/>
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href='/shoeper-bowl'
                        sx={{
                            mr: 2,
                            display: {xs: 'none', md: 'flex'},
                            fontWeight: 600,
                            letterSpacing: '.05rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        Shoe-per Bowl
                    </Typography>
                    <Box sx={{flexGrow: 1, display: {xs: 'flex', md: 'none'}}}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon/>
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={profileAnchor}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(profileAnchor)}
                            onClose={handleCloseNavMenu}
                            sx={{display: {xs: 'block', md: 'none'}}}
                        >
                            {pages.filter(pg => pg.showInNavBar)?.map(({id, link, name}) => (
                                <a key={id} href={link} style={{textDecoration: 'none', color: 'inherit'}}>
                                    <MenuItem key={id} href={link}>
                                        <Typography sx={{textAlign: 'center'}}>{name}</Typography>
                                    </MenuItem>
                                </a>
                            ))}
                        </Menu>
                    </Box>
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="/shoeper-bowl"
                        sx={{
                            mr: 2,
                            display: {xs: 'flex', md: 'none'},
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        SHOE-PER BOWL
                    </Typography>
                    <Box sx={{flexGrow: 1, display: {xs: 'none', md: 'flex'}}}>
                        {pages.filter(page => page.showOnHeader)?.map(({id, link, name}) => (
                            <Button
                                key={id}
                                href={link}
                                sx={{my: 2, color: 'white', display: 'block'}}
                            >
                                {name}
                            </Button>
                        ))}
                    </Box>
                    <Box sx={{flexGrow: 0}}>
                        <Tooltip title={settings && settings.length ? "Open settings" : ""}>
                            <IconButton onClick={handleOpenUserMenu} sx={{p: 0}}>
                                <Avatar
                                    alt="">{userInfo?.firstName ? `${userInfo?.firstName?.charAt(0)}${userInfo?.lastName?.charAt(0)}` : ""}</Avatar>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{mt: '45px'}}
                            id="menu-appbar"
                            anchorEl={profileOpen}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(settings && settings.length ? profileOpen : false)}
                            onClose={handleCloseUserMenu}
                        >
                            {settings?.map((setting: Setting) => (
                                setting.name === 'Logout' ? (
                                    <MenuItem key={setting.name} onClick={logout}>
                                        <Typography textAlign="center">{setting.name}</Typography>
                                    </MenuItem>
                                ) : (
                                    <a key={setting.name} href={setting.link}
                                       style={{textDecoration: 'none', color: 'inherit'}}>
                                        <MenuItem>
                                            <Typography textAlign="center">{setting.name}</Typography>
                                        </MenuItem>
                                    </a>
                                )
                            ))}

                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}