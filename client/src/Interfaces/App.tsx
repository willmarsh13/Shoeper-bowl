import React from "react";
import {RoundType} from "../redux/rosterSlice";
import {Position} from "./Player";

export interface ThemeState {
    mode: 'light' | 'dark';
}

export interface AppState {
    headerHeight: number,
    footerHeight: number,
}

export interface subPage {
    path: string,
    element: React.JSX.Element,
}

export interface page {
    id: number,
    name: string,
    link: string,
    routerLink: string,
    element: React.JSX.Element,
    isIndex: boolean | undefined,
    showOnHeader: boolean | undefined,
    showInNavBar: boolean | undefined,
    childRoutes?: subPage[],
}

export interface GameInfo {
    round: RoundType,
    teams: string[],
    status: 'Active' | 'Locked' | 'Inactive' | null,
}

export interface Filters {
    teams: string[],
    positions: Position[],
}

export interface Setting {
    name: string,
    link: string,
}

export interface AccountInfo {
    Email: string,
    role: string,
    firstName: string,
    lastName: string,
}