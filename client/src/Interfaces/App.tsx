import React from "react";
import {RoundType} from "../redux/rosterSlice";
import {Position} from "./Player";

export interface ThemeState {
    mode: 'light' | 'dark';
}

export interface page {
    id: number,
    name: string,
    link: string,
    element:  React.JSX.Element,
    isIndex: boolean | undefined,
    showOnHeader: boolean | undefined,
    showInNavBar: boolean | undefined,
}

export interface GameInfo {
    round: RoundType,
    teams: string[],
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
    email: string,
    role: string,
    firstName: string,
    lastName: string,
}