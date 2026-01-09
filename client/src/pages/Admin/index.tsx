import React, {useEffect, useState} from "react";
import {
    Box,
    Drawer,
    List,
    ListItemButton,
    ListItemText,
    IconButton,
    Typography,
    useTheme,
    useMediaQuery,
    Divider,
    Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import GroupIcon from '@mui/icons-material/Group';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import {useSelector} from "react-redux";
import {RootState} from "../../redux/store";

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 64;
const STORAGE_KEY = "admin.sidebar.collapsed";

const adminPages = [
    {label: "Account Requests", path: "AccountRequests", icon: <TaskAltIcon/>},
    {label: "Accounts", path: "Accounts", icon: <GroupIcon/>},
    {label: "Scoring", path: "Scoring", icon: <ScoreboardIcon/>},
];

export default function Admin() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const navigate = useNavigate();
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const headerHeight = useSelector((state: RootState) => state.app.headerHeight)

    {/* Main Content */
    }
    const drawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

    const isActive = (path: string) => {
        const pathname = location.pathname;

        // Default admin route → Account Requests
        if (
            path === "requests" &&
            (pathname === "/Admin" || pathname === "/Admin/")
        ) {
            return true;
        }

        return pathname.includes(`/Admin/${path}`);
    };

    // Load persisted state
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
            setCollapsed(stored === "true");
        }
    }, []);

    const toggleCollapse = () => {
        const next = !collapsed;
        setCollapsed(next);
        localStorage.setItem(STORAGE_KEY, String(next));
    };

    const drawerContent = (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: collapsed ? "center" : "space-between",
                    p: 2,
                }}
            >
                {!collapsed && <Typography variant="h6">Admin</Typography>}

                {!isMobile && (
                    <IconButton onClick={toggleCollapse}>
                        {collapsed ? <ChevronRightIcon/> : <ChevronLeftIcon/>}
                    </IconButton>
                )}
            </Box>

            <Divider/>

            <List>
                {adminPages.map(page => {
                    const active = isActive(page.path);

                    return (
                        <ListItemButton
                            key={page.path}
                            selected={active}
                            onClick={() => {
                                navigate(page.path);
                                setMobileOpen(false);
                            }}
                            sx={{
                                justifyContent: collapsed ? "center" : "flex-start",
                                px: collapsed ? 1 : 2,
                                py: 1.5,
                            }}
                        >
                            {collapsed ? (
                                <Tooltip title={page.label} placement="right">
                                    <Box>{page.icon}</Box>
                                </Tooltip>
                            ) : (
                                <>
                                    <Box sx={{mr: 2}}>{page.icon}</Box>
                                    <ListItemText primary={page.label}/>
                                </>
                            )}
                        </ListItemButton>
                    );
                })}
            </List>
        </Box>
    );

    return (
        <Box sx={{display: "flex", height: '100%'}}>
            {/* Mobile menu button */}
            {isMobile && (
                <IconButton
                    onClick={() => setMobileOpen(true)}
                    sx={{
                        position: "fixed",
                        left: 16,
                        zIndex: theme.zIndex.drawer + 1,
                    }}
                >
                    <MenuIcon/>
                </IconButton>
            )}

            {/* Mobile Drawer */}
            {isMobile && (
                <Drawer
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{keepMounted: true}}
                    sx={{
                        "& .MuiDrawer-paper": {
                            width: DRAWER_WIDTH,
                            height: '100%',
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            )}

            {/* Desktop Drawer */}
            {!isMobile && (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        "& .MuiDrawer-paper": {
                            width: drawerWidth,
                            top: headerHeight,
                            height: `calc(100% - ${headerHeight}px)`,
                            transition: theme.transitions.create("width", {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.standard,
                            }),
                            overflowX: "hidden",
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            )}

            <Box
                component="main"
                sx={{
                    height: '100%',
                    flexGrow: 1,
                    p: 3,
                    px: 2,
                    pb: 0,
                    overflowX: "auto",
                    transition: theme.transitions.create("margin", {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.standard,
                    }),
                }}
            >
                <Outlet/>
            </Box>

        </Box>
    );
}
