import * as React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import debounce from 'lodash.debounce';
import {useListRef} from 'react-window';
import {Paper} from '@mui/material';
import {useSelector} from 'react-redux';

import {Player, Position} from '../../../../Interfaces/Player';
import {getPlayers} from '../../logic/getPlayers';
import {ListboxComponent, StyledPopper} from './logic/helpers';
import {
    deriveAllowedTeams,
    PlayoffRound,
    ROUND_CONFIG,
} from '../../logic/roundRules';
import {RootState} from '../../../../redux/store';

interface Props {
    selectedPlayers: Player[];
    onSelect: (player: Player | null) => void;
}

const PlayerAutoComplete: React.FC<Props> = ({
                                                 selectedPlayers,
                                                 onSelect,
                                             }) => {
    const [players, setPlayers] = React.useState<Player[]>([]);
    const [page, setPage] = React.useState(1);
    const [hasMore, setHasMore] = React.useState(true);
    const [loading, setLoading] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');

    const internalListRef = useListRef(null);
    const optionIndexMapRef = React.useRef<Map<string, number>>(new Map());
    const maxRenderedIndexRef = React.useRef(-1);
    const isInitialLoadCompleteRef = React.useRef(false);
    const isPagingRef = React.useRef(false);

    const round = useSelector(
        (s: RootState) => s.roster.round
    ) as PlayoffRound;

    const roundConfig = ROUND_CONFIG[round];

    const playoffTeams = useSelector((s: RootState) => s.gameInfo.teams);
    const teamFilter = useSelector((s: RootState) => s.filters.teams);
    const positionFilter = useSelector((s: RootState) => s.filters.positions);

    /* ------------------------------------------------------------------
       Teams allowed (round rules → selected players → UI filter)
    ------------------------------------------------------------------ */

    const effectiveTeams = React.useMemo(() => {
        if (!playoffTeams || playoffTeams.length === 0) return [];

        let teams = deriveAllowedTeams(
            playoffTeams,
            selectedPlayers,
            roundConfig
        );

        if (teamFilter && teamFilter.length > 0) {
            teams = teams.filter(t => teamFilter.includes(t));
        }

        return teams;
    }, [playoffTeams, selectedPlayers, roundConfig, teamFilter]);

    /* ------------------------------------------------------------------
       Remaining positions based on round capacity
    ------------------------------------------------------------------ */

    const remainingPositions = React.useMemo<Position[]>(() => {
        const allowedCounts = roundConfig?.allowedPositions.reduce<Record<string, number>>(
            (acc, pos) => {
                acc[pos] = (acc[pos] || 0) + 1;
                return acc;
            },
            {}
        );

        const usedCounts = selectedPlayers.reduce<Record<string, number>>(
            (acc, p) => {
                acc[p.position] = (acc[p.position] || 0) + 1;
                return acc;
            },
            {}
        );

        return Object.entries(allowedCounts)
            ?.filter(([pos, allowed]) => {
                const used = usedCounts[pos] || 0;
                return used < allowed;
            })
            ?.map(([pos]) => pos as Position);
    }, [roundConfig?.allowedPositions, selectedPlayers]);

    /* ------------------------------------------------------------------
       Apply optional UI position filter
    ------------------------------------------------------------------ */

    const effectivePositions = React.useMemo<Position[]>(() => {
        let positions = remainingPositions;

        if (positionFilter && positionFilter.length > 0) {
            positions = positions.filter(p => positionFilter.includes(p));
        }

        return positions;
    }, [remainingPositions, positionFilter]);

    /* ------------------------------------------------------------------
       Exclude teams that hit maxPlayersPerTeam
    ------------------------------------------------------------------ */

    const excludedTeams = React.useMemo(() => {
        const counts = selectedPlayers.reduce<Record<string, number>>((acc, p) => {
            acc[p.team] = (acc[p.team] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(counts)
            ?.filter(([, count]) => count >= roundConfig.maxPlayersPerTeam)
            ?.map(([team]) => team);
    }, [selectedPlayers, roundConfig.maxPlayersPerTeam]);

    /* ------------------------------------------------------------------
       Virtualized list helpers
    ------------------------------------------------------------------ */

    const handleItemsBuilt = React.useCallback(
        (map: Map<string, number>) => {
            optionIndexMapRef.current = map;
        },
        []
    );

    const handleHighlightChange = (
        _: React.SyntheticEvent,
        option: Player | null
    ) => {
        if (!option || !internalListRef.current) return;

        const index = optionIndexMapRef.current.get(option.full_name);
        if (index !== undefined) {
            internalListRef.current.scrollToRow({index, align: 'auto'});
        }
    };

    /* ------------------------------------------------------------------
       Data loading
    ------------------------------------------------------------------ */

    const loadPlayers = React.useCallback(
        async (reset = false, search = '') => {
            if (loading || (!hasMore && !reset)) return;

            if (reset) {
                maxRenderedIndexRef.current = -1;
                setPage(1);
                setHasMore(true);
            }

            setLoading(true);

            const res = await getPlayers({
                search,
                page: reset ? 1 : page,
                pageSize: 100,
                teams: effectiveTeams.filter(t => !excludedTeams.includes(t)),
                positions: effectivePositions,
            });

            setPlayers(prev => (reset ? res.results : [...prev, ...res.results]));
            setHasMore(res.results.length === 100);
            setPage(p => (reset ? 2 : p + 1));

            setLoading(false);
            isPagingRef.current = false;
            isInitialLoadCompleteRef.current = true;
        },
        [
            loading,
            hasMore,
            page,
            effectiveTeams,
            effectivePositions,
            excludedTeams,
        ]
    );

    /* ------------------------------------------------------------------
       Refresh on rule changes
    ------------------------------------------------------------------ */

    React.useEffect(() => {
        setPlayers([]);
        setPage(1);
        setHasMore(true);
        isPagingRef.current = false;
        isInitialLoadCompleteRef.current = false;

        loadPlayers(true, searchTerm);
    }, [round, effectiveTeams, effectivePositions]);

    /* ------------------------------------------------------------------
       Debounced search
    ------------------------------------------------------------------ */

    const debouncedSearch = React.useMemo(
        () =>
            debounce((value: string) => {
                loadPlayers(true, value);
            }, 300),
        [loadPlayers]
    );

    React.useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    /* ------------------------------------------------------------------
       Infinite scroll trigger
    ------------------------------------------------------------------ */

    const maybeLoadMore = React.useCallback(
        (rowIndex: number) => {
            if (!isInitialLoadCompleteRef.current) return;

            maxRenderedIndexRef.current = Math.max(
                maxRenderedIndexRef.current,
                rowIndex
            );

            if (
                maxRenderedIndexRef.current >= players.length - 15 &&
                hasMore &&
                !loading &&
                !isPagingRef.current
            ) {
                isPagingRef.current = true;
                loadPlayers(false, searchTerm);
            }
        },
        [players.length, hasMore, loading, loadPlayers, searchTerm]
    );

    /* ------------------------------------------------------------------
       Render
    ------------------------------------------------------------------ */

    return (
        <Paper sx={{padding: 1}}>
            <Autocomplete<Player>
                inputValue={searchTerm}
                loading={loading}
                disableListWrap
                options={players}
                noOptionsText={hasMore ? 'Waiting…' : 'No options'}
                getOptionLabel={(p) => p.full_name}
                onInputChange={(_, v) => {
                    setSearchTerm(v);
                    debouncedSearch(v);
                }}
                onHighlightChange={handleHighlightChange}
                onChange={(_, v) => {
                    onSelect(v);
                    setSearchTerm('');
                }}
                renderInput={(params) => (
                    <TextField {...params} label="Search for a player..."/>
                )}
                renderOption={(props, option, state) =>
                    [props, option, state.index] as React.ReactNode
                }
                renderGroup={(params) => params as any}
                slots={{popper: StyledPopper}}
                slotProps={{
                    listbox: {
                        component: ListboxComponent,
                        internalListRef,
                        onItemsBuilt: handleItemsBuilt,
                        onRowRender: maybeLoadMore,
                    } as any,
                }}
            />
        </Paper>
    );
};

export default PlayerAutoComplete;
