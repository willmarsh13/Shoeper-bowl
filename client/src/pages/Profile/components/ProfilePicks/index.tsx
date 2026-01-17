import * as React from 'react';
import {
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Stack,
    Divider,
} from '@mui/material';
import {Position, ProfilePick} from '../../../../Interfaces/Player';
import {RoundConfig} from "../../../BuildTeam/logic/roundRules";
import {useEffect} from "react";

interface ProfilePicksProps {
    picks: ProfilePick[];
}

const POSITION_ORDER = ['QB', 'RB', 'WR', 'TE', 'K', 'DST'];
export const position_mapping = {
    QB: 'Quarterback',
    RB: 'Running Back',
    WR: 'Wide Receiver',
    TE: 'Tight End',
    K: 'Kicker',
    'DST': 'Defense/Special Teams'
}

const ProfilePicks: React.FC<ProfilePicksProps> = ({picks}) => {

    const groupedByPosition = React.useMemo(() => {
        return picks.reduce<Record<string, ProfilePick[]>>((acc, pick) => {
            acc[pick.position] = acc[pick.position] || [];
            acc[pick.position].push(pick);
            return acc;
        }, {});
    }, [picks]);

    if (picks.length === 0) {
        return (
            <Paper sx={{p: 3}}>
                <Typography color="text.secondary">
                    No picks found.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{p: 3}}>
            <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h5">
                        My Picks
                    </Typography>
                </Stack>

                <Divider/>

                <TableContainer>
                    <Table size='small'>
                        <TableHead
                            sx={{
                                backgroundColor: theme =>
                                    theme.palette.background.paper,
                            }}
                        >
                            <TableRow>
                                <TableCell><strong>Position</strong></TableCell>
                                <TableCell><strong>Player</strong></TableCell>
                                <TableCell><strong>Team</strong></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {POSITION_ORDER?.map((position, index) => {
                                const rows = groupedByPosition[position];
                                if (!rows) return null;

                                return (
                                    <React.Fragment key={position}>
                                        {index !== 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} sx={{height: 16, borderBottom: 0}}/>
                                            </TableRow>
                                        )}

                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                sx={{
                                                    borderTop: theme => `${theme.palette.primary.main}`,
                                                    py: 1,
                                                }}
                                            >
                                                <Typography
                                                    variant="overline"
                                                    fontWeight={700}
                                                    letterSpacing={1}
                                                    textAlign="center"
                                                >
                                                    {position_mapping[position as Position]}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>

                                        {rows?.map(pick => (
                                            <TableRow key={pick.id}>
                                                <TableCell
                                                    sx={{
                                                        color: 'text.secondary',
                                                        py: 1,
                                                        borderLeft: theme => `6px solid ${theme.palette.primary.main}`,
                                                    }}>
                                                    {pick.player.position}
                                                </TableCell>
                                                <TableCell>
                                                    {pick.player.full_name}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={pick.player.team}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>
        </Paper>
    );
};

export default ProfilePicks;
