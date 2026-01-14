import React, {useEffect, useMemo, useState} from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Stack,
    Select,
    MenuItem,
    Button, Tooltip, IconButton,
} from "@mui/material";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import {getURL} from "../../Shared/getURL";
import checkUnauthorized from "../../Shared/handleCheckUnauth";
import {ROUND_CONFIG, RoundConfig} from "../BuildTeam/logic/roundRules";
import InfoIcon from "@mui/icons-material/Info";
import RulesModal from "../BuildTeam/components/RuleModal";

/* =======================
   Types
======================= */

interface Player {
    full_name: string;
    team: string;
    position: string;
}

interface Scoring {
    totalPoints: number;
}

interface RosterItem {
    slotId: string;
    position: string;
    player: Player;
    scoring: Scoring;
}

interface UserOverview {
    email: string;
    firstName: string;
    lastName: string;
    perRoundScores: Record<string, number>;
    perRoundRoster: Record<string, RosterItem[]>;
    totalScore: number;
}


interface OverviewResponse {
    currentRound: string;
    rounds: string[];
    users: UserOverview[];
}

/* =======================
   Component
======================= */

const OverviewPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<UserOverview[]>([]);
    const [rounds, setRounds] = useState<RoundConfig[]>([]);
    const [currentRound, setCurrentRound] = useState<string>("");
    const [selectedRound, setSelectedRound] = useState<string>("");
    const [rulesModalOpen, setRulesModalOpen] = useState<boolean>(false);

    useEffect(() => {
        setRounds(Object.values(ROUND_CONFIG));
    }, []);

    useEffect(() => {
        const fetchOverview = async () => {
            const res = await fetch(`${getURL()}/api/overview`, {
                credentials: "include",
            });

            const data = await res.json();
            checkUnauthorized(data.status);

            if (!data.data) return;

            const overview: OverviewResponse = data.data;

            setUsers(overview.users);
            setCurrentRound(overview.currentRound);
            setSelectedRound(overview.currentRound);
            setLoading(false);
        };

        fetchOverview();
    }, []);

    /* =======================
       Derived State
    ======================= */

    const rosterColumns: GridColDef[] = useMemo(() => {
        const slotIds = Array.from(
            new Set(
                users.flatMap(u =>
                    (u.perRoundRoster[selectedRound] || []).map(slot => slot.slotId)
                )
            )
        );

        return slotIds.map(slotId => ({
            field: slotId,
            headerName: slotId,
            flex: 1,
            sortable: false,
            minWidth: 175,
        }));
    }, [users, selectedRound]);


    const columns: GridColDef[] = [
        {
            field: "name",
            headerName: "Name",
            flex: 1,
            minWidth: 150,
        },
        {
            field: "roundScore",
            headerName: "Round",
            type: "number",
            flex: 1,
            sortable: true,
            valueFormatter: (val: number) =>
                val != null ? val.toFixed(2) : "0.00",
            minWidth: 100,
        },
        {
            field: "totalScore",
            headerName: "Total",
            type: "number",
            flex: 1,
            sortable: true,
            valueFormatter: (val: number) =>
                val != null ? val.toFixed(2) : "0.00",
            minWidth: 100,
        },
        ...rosterColumns,
    ];

    const rows = useMemo(() => {
        return users.map((user, idx) => {
            const row: Record<string, any> = {
                id: idx,
                name: `${user.firstName} ${user.lastName}`,
                roundScore: user.perRoundScores[selectedRound] ?? 0,
                totalScore: user.totalScore,
            };

            const roster = user.perRoundRoster[selectedRound] || [];

            for (const slot of roster) {
                row[slot.slotId] = slot?.player?.full_name ?
                    `${slot?.player?.full_name} (${slot?.scoring?.totalPoints?.toFixed(2)})` : ''
            }

            return row;
        });
    }, [users, selectedRound]);


    /* =======================
       Export
    ======================= */

    const exportToExcel = () => {
        const exportRows = rows.map(r => {
            const cleanRow: Record<string, any> = {};
            columns.forEach(col => {
                const val = r[col.field];
                cleanRow[col.headerName as string] =
                    typeof val === "number" ? val.toFixed(2) : val ?? "";
            });
            return cleanRow;
        });

        const ws = XLSX.utils.json_to_sheet(exportRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Overview");

        XLSX.writeFile(
            wb,
            `overview_${selectedRound.toLowerCase()}.xlsx`
        );
    };

    useEffect(() => {
        console.log(rows)
    }, [rows]);

    /* =======================
       Render
    ======================= */

    if (loading) {
        return (
            <Box mt={5} display="flex" justifyContent="center">
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <>
            <Stack
                spacing={2}
                p={1}
                py={2}
                height='100%'
            >
                <Stack
                    px={2}
                    flexDirection='row'
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                >
                    <Box>
                        <Tooltip title="Game Info & Rules">
                            <IconButton color='primary' onClick={() => setRulesModalOpen(!rulesModalOpen)}>
                                <InfoIcon/>
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Typography variant="h5" flexGrow={1} sx={{marginTop: '0 !important'}}>Overview</Typography>

                    <Stack direction="row" spacing={2}>
                        <Select
                            size="small"
                            value={selectedRound}
                            onChange={e => setSelectedRound(e.target.value)}
                        >
                            {rounds.map(round => (
                                <MenuItem key={round.key} value={round.key}>
                                    {round.displayName}
                                </MenuItem>
                            ))}
                        </Select>

                        <Button
                            variant="contained"
                            onClick={exportToExcel}
                        >
                            Export
                        </Button>
                    </Stack>
                </Stack>

                <Box flex={1} minHeight={0}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        initialState={{
                            sorting: {
                                sortModel: [
                                    {field: "roundScore", sort: "desc"},
                                ],
                            },
                        }}
                        disableRowSelectionOnClick
                        sx={{
                            height: "100%",
                            fontSize: "0.85rem",
                            "& .MuiDataGrid-cell": {
                                py: 0.5,
                            },
                        }}
                    />
                </Box>
            </Stack>
            <RulesModal open={rulesModalOpen} onClose={(newVal) => setRulesModalOpen(newVal)}/>
        </>
    );
};

export default OverviewPage;
