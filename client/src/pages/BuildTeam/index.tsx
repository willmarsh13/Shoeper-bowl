import React, {useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchPlayers} from '../../redux/playersSlice';
import PlayerAutoComplete from './components/PlayerAutoComplete';
import RosterView from './components/RosterView';
import {RootState} from '../../redux/store';
import {
    placePlayerAuto,
    removePlayerFromSlot,
    resetRoster,
    setRound,
    setRosterFromApi,
    RosterSlot,
} from '../../redux/rosterSlice';
import {Container, Box, Typography, Button, Alert, Tooltip} from '@mui/material';
import {Player} from '../../Interfaces/Player';
import {PlayoffRound, ROUND_CONFIG} from "./logic/roundRules";
import {Filters} from "./components/Filters";
import getGameInfo from "../../Shared/logic/getGameInfo";
import {setTeams} from "../../redux/reducers/appReducer";
import BuildConfirmedDialog from "./components/BuildConfirmed";
import postTeam, {PostTeamPayload} from "./logic/postTeam";
import {enqueueSnackbar} from "notistack";
import getTeam from "./logic/getTeam";

const BuildTeam: React.FC = () => {
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [loadingSavePicks, setLoadingSavedPicks] = useState<boolean>(false);
    const [initialRoster, setInitialRoster] = useState<RosterSlot[] | null>(null);


    const dispatch = useDispatch();
    const loading = useSelector((s: RootState) => s.players.loading);
    const roster = useSelector((s: RootState) => s.roster.slots);
    const round = useSelector((s: RootState) => s.roster.round);

    useEffect(() => {
        Promise.all([getTeam(), getGameInfo()])
            .then(([teamData, gameInfo]) => {
                dispatch(setTeams(gameInfo.teams));

                if (teamData?.round && teamData?.roster?.length) {
                    dispatch(setRosterFromApi({
                        round: teamData.round,
                        roster: teamData.roster,
                    }));

                    // store snapshot for dirty check
                    setInitialRoster(teamData.roster);
                } else {
                    dispatch(setRound(gameInfo.round));
                    setInitialRoster(null); // no saved roster
                }
            });
    }, [dispatch]);

    const normalizeRoster = (slots: RosterSlot[]) =>
        slots?.map(s => ({
            slotId: s.slotId,
            playerName: s.player?.full_name ?? null,
            team: s.player?.team ?? null,
            position: s.player?.position ?? null,
        }));

    const hasChanges = useMemo(() => {
        if (!initialRoster) {
            // No saved roster → any pick means change
            return roster?.some(s => s.player);
        }

        const current = normalizeRoster(roster);
        const initial = normalizeRoster(initialRoster);

        return JSON.stringify(current) !== JSON.stringify(initial);
    }, [roster, initialRoster]);

    useEffect(() => {
        dispatch(fetchPlayers({}) as any);
    }, [dispatch]);

    const teamCounts = useMemo(() => {
        const map: Record<string, number> = {};
        roster?.forEach(s => {
            if (s.player) {
                map[s.player.team] = (map[s.player.team] || 0) + 1;
            }
        });
        return map;
    }, [roster]);

    const maxPerTeam = useMemo(() => {
        const config = ROUND_CONFIG[round as PlayoffRound];
        return config ? config.maxPlayersPerTeam : 1;
    }, [round]);

    const onSelect = (p: Player | null) => {
        dispatch(placePlayerAuto({player: p}) as any);
    };

    const onRemove = (slotId: string) => {
        dispatch(removePlayerFromSlot({slotId}));
    };

    const onSubmit = () => {
        const payload: PostTeamPayload = {
            round,
            roster: roster?.map(s => ({
                slotId: s.slotId,
                position: s.position,
                player: s.player
                    ? {
                        id: s.player.id,
                        full_name: s.player.full_name,
                        team: s.player.team,
                        position: s.player.position,
                    }
                    : null,
            })),
            timestamp: new Date().toISOString(),
            saved: true,
        };

        setLoadingSavedPicks(true)
        postTeam(payload)
            .then(data => {
                if (data.status === 200) {
                    setSuccessModalOpen(true);
                } else {
                    enqueueSnackbar(`${data.message}`, data.variant)
                }
            })
            .finally(() => {
                setLoadingSavedPicks(false)
            })
    };

    const allSlotsFilled = useMemo(() => {
        return roster?.every(slot => !!slot.player);
    }, [roster]);

    const hasAnyPick = useMemo(() => {
        return roster?.some(slot => !!slot.player);
    }, [roster]);

    return (
        <>
            <Container maxWidth="lg" sx={{py: 4}}>
                <Typography variant="h4" gutterBottom>Fantasy Post-Season Roster Builder</Typography>

                <Box sx={{mb: 3}}>
                    <Filters/>
                </Box>

                <Box sx={{mb: 3}}>
                    <PlayerAutoComplete
                        selectedPlayers={roster
                            ?.filter(s => s.player)
                            ?.map(s => s.player!)}
                        onSelect={onSelect}
                    />
                    {loading && <Typography variant="caption">Loading players...</Typography>}
                </Box>

                <Box sx={{mb: 3}}>
                    <Typography variant="h6">Current roster</Typography>
                    <RosterView slots={roster as RosterSlot[]} onRemove={onRemove}/>
                </Box>

                <Box sx={{display: 'flex', gap: 2, mb: 2}}>
                    <Tooltip title={!hasChanges ? `No changes to save` : `Save roster`}>
                        <Button
                            variant="contained"
                            onClick={onSubmit}
                            disabled={!allSlotsFilled || !hasChanges}
                            loading={loadingSavePicks}
                        >
                            Save & Submit Roster
                        </Button>
                    </Tooltip>

                    <Button
                        variant="outlined"
                        onClick={() => dispatch(resetRoster())}
                        disabled={!hasAnyPick}
                    >
                        Reset Roster
                    </Button>
                </Box>


                <Box>
                    <Alert severity="info">
                        Team picks limit: <strong>{maxPerTeam}</strong> per team in selected round.
                    </Alert>
                </Box>
            </Container>

            <BuildConfirmedDialog open={successModalOpen} handleClose={() => null}/>
        </>
    );
};

export default BuildTeam;
