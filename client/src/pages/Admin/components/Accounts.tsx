import React, { useEffect, useState } from "react";
import {
    Box,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Collapse,
    IconButton,
    Stack,
    Tooltip,
    Button,
    TableSortLabel
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
import { getURL } from "../../../Shared/getURL";
import dayjs from "dayjs";
import { PlayoffRound, ROUND_CONFIG, RoundConfig } from "../../BuildTeam/logic/roundRules";
import { RosterSlot } from "../../../redux/rosterSlice";
import { exportPicksToExcel } from "../logic/exportPicksToExcel";

interface UserPick {
    email: string,
    firstName: string,
    lastName: string,
    roster: RosterSlot[],
    round: PlayoffRound,
    saved: boolean,
    timestamp: string
}

export interface AccountRequest {
    Email: string;
    firstName: string;
    lastName: string;
    created: string;
    hasPicks: boolean;
    picks: UserPick[];
}

/* =====================
   Row Component
===================== */

function AccountRow({ row }: { row: AccountRequest }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <TableRow hover>
                <TableCell>
                    {row.hasPicks && (
                        <IconButton size="small" onClick={() => setOpen(!open)}>
                            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    )}
                </TableCell>
                <TableCell>{row.firstName}</TableCell>
                <TableCell>{row.lastName}</TableCell>
                <TableCell>{row.Email}</TableCell>
                <TableCell>{dayjs(row.created).format('ddd MMM D, h:mma')}</TableCell>
                <TableCell align='center'>
                    {row.hasPicks ? (
                        <Tooltip title={`Submitted: ${dayjs(row.picks[0].timestamp).format('ddd MMM D, h:mma')}`}>
                            <CheckIcon color='success' />
                        </Tooltip>
                    ) : (
                        <ClearIcon color='error' />
                    )}
                </TableCell>
            </TableRow>

            {row.hasPicks && row.picks[0] && (
                <TableRow>
                    <TableCell colSpan={6} sx={{ p: 0 }}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ m: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    User Picks
                                </Typography>

                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Slot</TableCell>
                                            <TableCell>Position</TableCell>
                                            <TableCell>Player Name</TableCell>
                                            <TableCell>Team</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {row.picks[0].roster.map((pick) => (
                                            <TableRow key={pick.slotId}>
                                                <TableCell>{pick.slotId || '-'}</TableCell>
                                                <TableCell>{pick.position || '-'}</TableCell>
                                                <TableCell>{pick.player?.full_name || '-'}</TableCell>
                                                <TableCell>{pick.player?.team || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}

/* =====================
   Main Component
===================== */

type SortOrder = 'asc' | 'desc';

export default function Accounts() {
    const [data, setData] = useState<AccountRequest[]>([]);
    const [round, setRound] = useState<RoundConfig>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [sortBy, setSortBy] = useState<'picks' | 'created' | 'firstName' | 'lastName' | 'Email'>('picks');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await fetch(`${getURL()}/api/Admin/Accounts`, {
                    credentials: "include",
                    headers: { "Content-Type": "application/json" }
                });
                const json = await res.json();
                setData(json.results);
                setRound(ROUND_CONFIG[json.round as PlayoffRound]);
            } catch (err) {
                console.error(err);
                setError("Unable to load account requests");
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, []);

    // General-purpose sorting function
    const sortedData = [...data].sort((a, b) => {
        let aVal: any;
        let bVal: any;

        switch (sortBy) {
            case 'firstName':
            case 'lastName':
            case 'Email':
                aVal = a[sortBy].toLowerCase();
                bVal = b[sortBy].toLowerCase();
                if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
                return 0;

            case 'created':
                aVal = new Date(a.created).getTime();
                bVal = new Date(b.created).getTime();
                return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;

            case 'picks':
                aVal = a.hasPicks ? 1 : 0;
                bVal = b.hasPicks ? 1 : 0;
                if (aVal !== bVal) return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
                // tie-breaker: newest first
                return new Date(b.created).getTime() - new Date(a.created).getTime();

            default:
                return 0;
        }
    });

    const handleSort = (column: typeof sortBy) => {
        if (sortBy === column) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
        </Box>
    );

    if (error) return (
        <Typography color="error" align="center">{error}</Typography>
    );

    return (
        <Paper>
            <Stack spacing={2} pt={3} pb={1} textAlign="center">
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 2 }}>
                    <Typography variant="h4">Account Status</Typography>
                    <Tooltip title="Export picks as Excel">
                        <Button
                            size='small'
                            variant="outlined"
                            onClick={() => exportPicksToExcel(data, round)}
                        >
                            Export
                        </Button>
                    </Tooltip>
                </Box>

                <TableContainer
                    component={Paper}
                    sx={{
                        maxHeight: 600,
                        overflowX: "auto",
                        overflowY: "auto",
                    }}
                >
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell>
                                    <TableSortLabel
                                        active={sortBy === 'firstName'}
                                        direction={sortOrder}
                                        onClick={() => handleSort('firstName')}
                                    >
                                        First Name
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={sortBy === 'lastName'}
                                        direction={sortOrder}
                                        onClick={() => handleSort('lastName')}
                                    >
                                        Last Name
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={sortBy === 'Email'}
                                        direction={sortOrder}
                                        onClick={() => handleSort('Email')}
                                    >
                                        Email
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={sortBy === 'created'}
                                        direction={sortOrder}
                                        onClick={() => handleSort('created')}
                                    >
                                        Requested At
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={sortBy === 'picks'}
                                        direction={sortOrder}
                                        onClick={() => handleSort('picks')}
                                    >
                                        {`${round?.displayName} Picks`}
                                    </TableSortLabel>
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {sortedData.map(row => (
                                <AccountRow key={row.Email} row={row} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>
        </Paper>
    );
}
