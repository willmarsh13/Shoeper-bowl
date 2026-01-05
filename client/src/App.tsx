import React, {useEffect, useState} from 'react';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import BuildTeam from './pages/BuildTeam'
import HomePage from './pages/Home'
import Header from "./Shared/Header";
import Admin from "./pages/Admin"
import {page} from "./Interfaces/App";
import LoginPage from "./pages/login/LoginPage";
import ForgotPW from "./pages/login/ForgotPW";
import SignUp from "./pages/login/SignUp";
import {getURL} from "./Shared/getURL";
import {enqueueSnackbar} from "notistack";
import {allowedPages} from "./Shared/logic/getGameInfo";
import Profile from "./pages/Profile";
import checkUnauthorized from "./Shared/handleCheckUnauth";

export const pages: page[] = [
    {
        id: 0,
        element: <HomePage/>,
        name: 'Home',
        link: '/shoeper-bowl',
        routerLink: '/',
        isIndex: true,
        showOnHeader: true,
        showInNavBar: true,
    },
    {
        id: 1,
        element: <BuildTeam/>,
        name: 'Team Builder',
        link: '/shoeper-bowl/BuildTeam',
        routerLink: '/BuildTeam',
        isIndex: false,
        showOnHeader: true,
        showInNavBar: true,
    },
    {
        id: 2,
        element: <Admin/>,
        name: 'Admin',
        link: '/shoeper-bowl/Admin',
        routerLink: '/Admin',
        isIndex: false,
        showOnHeader: false,
        showInNavBar: false,
    },
    {
        id: 3,
        element: <Profile/>,
        name: 'Profile',
        link: '/shoeper-bowl/Profile',
        routerLink: '/Profile',
        isIndex: false,
        showOnHeader: false,
        showInNavBar: true,
    },
    {
        id: 5,
        element: <LoginPage/>,
        name: 'Login',
        link: '/shoeper-bowl/login',
        routerLink: '/login',
        isIndex: false,
        showOnHeader: false,
        showInNavBar: false,
    },
    {
        id: 6,
        element: <ForgotPW/>,
        name: 'Forgot Password',
        link: '/shoeper-bowl/forgotPW',
        routerLink: '/forgotPW',
        isIndex: false,
        showOnHeader: false,
        showInNavBar: false,
    },
    {
        id: 7,
        element: <SignUp/>,
        name: 'Sign Up',
        link: '/shoeper-bowl/signUp',
        routerLink: '/signUp',
        isIndex: false,
        showOnHeader: false,
        showInNavBar: false,
    },
];

export default function App() {
    const [settings, setSettings] = useState([]);
    const [userInfo, setUserInfo] = useState({
        email: '',
        role: '',
        firstName: '',
        lastName: '',
    });

    useEffect(() => {
        fetch(`${getURL()}/api/HTML/header`, {
            headers: {"Content-Type": "application/json"},
            credentials: "include",
        })
            .then((resp) => resp?.json())
            .then((data) => {
                checkUnauthorized(data.status);
                setSettings(data?.settings);
                setUserInfo(data?.accountInfo);
            })
            .catch(() => {
                enqueueSnackbar("There was an error rendering the page", {variant: 'error'});
            });
    }, []);

    return (
        <>
            <BrowserRouter basename="/shoeper-bowl">
                {!allowedPages.includes(window.location.pathname) && <Header settings={settings} userInfo={userInfo}/>}
                <Routes>
                    {pages?.map(({id, routerLink, isIndex, element}) => (
                        <Route key={id} index={isIndex} path={routerLink} element={element}/>
                    ))}
                </Routes>
            </BrowserRouter>
        </>
    );
};
