import React, {useEffect, useState} from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Button,
    Stack
} from '@mui/material';
import {DataGrid, GridColDef, GridRowsProp} from '@mui/x-data-grid';
import {getURL} from "../../Shared/getURL";
import checkUnauthorized from "../../Shared/handleCheckUnauth";
import * as XLSX from 'xlsx';
import {CustomToolbar} from "../Admin/pages/ScoringAdmin/components/CustomToolbar";

interface Player {
    full_name: string;
    team: string;
    position: string;
}

interface Roster {
    player: Player;
    position: string;
    slotId: string;
}

interface UserPick {
    email: string;
    firstName: string;
    lastName: string;
    roster: Roster[];
}

const OverviewPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);
    const [picks, setPicks] = useState<UserPick[]>([]);
    const [slots, setSlots] = useState<string[]>([]);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const res = await fetch(`${getURL()}/api/overview`, {
                    headers: {'content-type': 'application/json'},
                    credentials: 'include'
                });
                const data = await res.json();
                checkUnauthorized(data.status);

                if (data.status === 200 && data.data) {
                    setPicks(data.data.picks);

                    const allSlots: string[] = Array.from(new Set(
                        data.data.picks.flatMap((user: UserPick) => user.roster.map(r => r.slotId))
                    ));

                    const slotOrder = ['QB', 'RB', 'RB2', 'WR', 'WR2', 'TE', 'FLEX', 'K', 'DST'];
                    const sortedSlots = allSlots.sort((a, b) => {
                        const ia: number = slotOrder.indexOf(a) !== -1 ? slotOrder.indexOf(a) : 999;
                        const ib: number = slotOrder.indexOf(b) !== -1 ? slotOrder.indexOf(b) : 999;
                        return ia - ib;
                    });

                    setSlots(sortedSlots);
                } else {
                    setMessage(data.message);
                }
            } catch (err: any) {
                setMessage(err?.response?.data?.message || "Error fetching overview");
            } finally {
                setLoading(false);
            }
        };

        fetchOverview();
    }, []);

    const exportToExcel = () => {
        const dataForExcel = picks.map((user) => {
            const row: Record<string, string> = {Name: `${user.firstName} ${user.lastName}`};
            slots.forEach((slotId) => {
                const rosterItem = user.roster.find(r => r.slotId === slotId);
                row[slotId] = rosterItem ? `${rosterItem.player.full_name} (${rosterItem.player.team})` : '';
            });
            return row;
        });

        const ws = XLSX.utils.json_to_sheet(dataForExcel);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Overview');
        XLSX.writeFile(wb, 'FantasyPicks.xlsx');
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" mt={5}>
                <CircularProgress/>
            </Box>
        );
    }

    if (message) {
        return (
            <Stack spacing={2} mt={5} textAlign="center" px={2}>
                <Typography variant="h6">{message}</Typography>
                <Button variant='contained' href='/shoeper-bowl/profile'>View my picks</Button>
            </Stack>
        );
    }

    // Columns
    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Name',
            flex: 1.5,
            minWidth: 150,
            headerClassName: 'super-app-theme--header',
            sortable: true,
        },
        ...slots.map(slot => ({
            field: slot,
            headerName: slot,
            flex: 1,
            minWidth: 120,
            sortable: true,
        }))
    ];

    // Rows
    const rows: GridRowsProp = picks.map((user, index) => {
        const row: Record<string, any> = {
            id: index,
            name: `${user.firstName} ${user.lastName}`,
        };
        slots.forEach(slot => {
            const rosterItem = user.roster.find(r => r.slotId === slot);
            row[slot] = rosterItem ? `${rosterItem.player.full_name} (${rosterItem.player.team})` : '';
        });
        return row;
    });

    return (
        <Stack my={2} px={1} height="calc(100vh - 105px)" spacing={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">Overview of Picks</Typography>
                <Button variant="contained" color="primary" onClick={exportToExcel}>
                    Export to Excel
                </Button>
            </Box>

            <Box flex={1} width="100%" sx={{overflowX: 'auto'}}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    checkboxSelection={false}
                    slots={{toolbar: CustomToolbar}}
                    sx={{
                        fontSize: '0.8rem', // smaller text
                        '& .MuiDataGrid-cell': {py: 0.5},
                        '& .MuiDataGrid-columnHeaders': {fontSize: '0.85rem', minHeight: 35},
                        '& .MuiDataGrid-row': {maxHeight: 60, alignItems: 'center'},
                    }}
                    showToolbar
                />
            </Box>
        </Stack>
    );
};

export default OverviewPage;
