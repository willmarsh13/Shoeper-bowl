import React, {useEffect, useState} from "react";
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
    Icon,
    Stack,
    Divider,
    Tooltip,
    Button
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
import {getURL} from "../../../Shared/getURL";
import dayjs from "dayjs";
import {PlayoffRound, ROUND_CONFIG, RoundConfig} from "../../BuildTeam/logic/roundRules";
import {RosterSlot} from "../../../redux/rosterSlice";
import {useSelector} from "react-redux";
import {RootState} from "../../../redux/store";
import {exportPicksToExcel} from "../logic/exportPicksToExcel";

/* =====================
   Types
===================== */

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

interface ApiResponse {
    message: string;
    count: number;
    results: AccountRequest[];
    round: PlayoffRound;
}

/* =====================
   Row Component
===================== */

function AccountRow({row}: { row: AccountRequest }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <TableRow hover>
                <TableCell>
                    {row.hasPicks && (
                        <IconButton size="small" onClick={() => setOpen(!open)}>
                            {open ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
                        </IconButton>
                    )}
                </TableCell>
                <TableCell>{row.firstName}</TableCell>
                <TableCell>{row.lastName}</TableCell>
                <TableCell>{row.Email}</TableCell>
                <TableCell>{dayjs(row.created).format('ddd MMM D, h:mma')}</TableCell>
                <TableCell align='center'>
                    {row.hasPicks ? (
                        <Tooltip title={`Submitted: ${(dayjs(row.picks[0].timestamp)).format('ddd MMM D, h:mma')}`}>
                            <Icon>
                                <CheckIcon color='success'/>
                            </Icon>
                        </Tooltip>
                    ) : (
                        <Icon><ClearIcon color='error'/></Icon>
                    )}
                </TableCell>
            </TableRow>

            {row.hasPicks && row.picks[0] && (
                <TableRow>
                    <TableCell colSpan={6} sx={{p: 0}}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{m: 2}}>
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
                                        {row.picks[0]?.roster?.map((pick) => (
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

function exportPicksToCSV(
    accounts: AccountRequest[],
    roundConfig?: RoundConfig
) {
    if (!roundConfig) return;

    // Positions across the X-axis
    const positions = roundConfig.allowedPositions;

    const headers = [
        "Name",
        "Email",
        ...positions
    ];

    const rows = accounts.map(account => {
        const pickMap: Record<string, string> = {};

        const roster = account.picks?.[0]?.roster ?? [];

        roster.forEach(pick => {
            if (pick.position && pick.player?.full_name) {
                pickMap[pick.position] = pick.player.full_name;
            }
        });

        return [
            `${account.firstName} ${account.lastName}`,
            account.Email,
            ...positions.map(pos => pickMap[pos] ?? "")
        ];
    });

    const csv = [
        headers.join(","),
        ...rows.map(row =>
            row.map(val => `"${val.replace(/"/g, '""')}"`).join(",")
        )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `shoeper-bowl-picks-${dayjs().format("YYYY-MM-DD")}.csv`;
    a.click();

    URL.revokeObjectURL(url);
}

/* =====================
   Main Component
===================== */

export default function Accounts() {
    const [data, setData] = useState<AccountRequest[]>([]);
    const [round, setRound] = useState<RoundConfig>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await fetch(`${getURL()}/api/Admin/Accounts`, {
                    credentials: "include",
                    headers: {"Content-Type": "application/json"}
                });

                if (!res.ok) throw new Error("Failed to load account requests");

                const json: ApiResponse = await res.json();
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

    if (loading) return (
        <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress/>
        </Box>
    );

    if (error) return (
        <Typography color="error" align="center">{error}</Typography>
    );

    return (
        <TableContainer component={Paper}>
            <Stack
                pt={3}
                pb={1}
                textAlign="center"
                direction="row"
                justifyContent="center"
                spacing={2}
            >
                <Typography variant="h4">Account Status</Typography>

                <Tooltip title="Export picks as Excel">
                    <Button
                        variant="outlined"
                        onClick={() => exportPicksToExcel(data, round)}
                    >
                        Export Picks (Excel)
                    </Button>
                </Tooltip>
            </Stack>

            <Divider variant='fullWidth'/>

            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell/>
                        <TableCell>First Name</TableCell>
                        <TableCell>Last Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Requested At</TableCell>
                        <TableCell>{`${round?.displayName} Picks`}</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {data.map((row) => (
                        <AccountRow key={row.Email} row={row}/>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
