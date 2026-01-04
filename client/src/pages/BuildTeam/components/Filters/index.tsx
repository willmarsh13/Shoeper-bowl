import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    Checkbox,
    ListItemText,
    Stack, Grid, OutlinedInput
} from '@mui/material';
import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import {setPositionFilters, setTeamFilters} from '../../../../redux/reducers/appReducer';
import {RootState} from "../../../../redux/store";
import {Position} from "../../../../Interfaces/Player";

export const Filters: React.FC = () => {
    const teamFilters = useSelector((s: RootState) => s.filters.teams);
    const positionFilters = useSelector((s: RootState) => s.filters.positions);
    const playoffTeams = useSelector((s: RootState) => s.gameInfo.teams);
    const roster = useSelector((s: RootState) => s.roster.slots);

    const dispatch = useDispatch()

    const handleTeamFilterChange = (event: SelectChangeEvent<typeof teamFilters>) => {
        const value = (event.target.value)
        const options = typeof value === 'string' ? value.split(',') : value
        dispatch(setTeamFilters(options));
    }

    const handlePositionFilterChange = (event: SelectChangeEvent<typeof positionFilters>) => {
        const value = (event.target.value)
        const options = typeof value === 'string' ? value.split(',') : value
        dispatch(setPositionFilters(options as Position[]));
    }

    const uniquePositions = React.useMemo<Position[]>(() => {
        return Array.from(
            new Set(roster.map(s => s.position))
        ) as Position[];
    }, [roster]);

    return (
        <>
            <Grid container spacing={2}>
                <Grid size={{xs: 12, sm: 6, lg: 4}}>
                    <FormControl size='small' fullWidth variant='outlined'>
                        <InputLabel id="team-filter-label">Teams</InputLabel>
                        <Select
                            multiple
                            labelId="team-filter-label"
                            id="team-filter"
                            value={teamFilters}
                            label="Teams"
                            input={<OutlinedInput label='Teams'/>}
                            renderValue={(selected) => selected.join(', ')}
                            onChange={handleTeamFilterChange}
                        >
                            {playoffTeams.map(team => (
                                <MenuItem key={team} value={team}>
                                    <Stack direction='row' alignItems='center'>
                                        <Checkbox sx={{paddingY: 0.5}} checked={teamFilters.includes(team)}/>
                                        <ListItemText primary={team}/>
                                    </Stack>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={{xs: 12, sm: 6, lg: 4}}>
                    <FormControl fullWidth variant='outlined' size='small'>
                        <InputLabel size='small' id="position-filter-label">Positions</InputLabel>
                        <Select
                            size='small'
                            multiple
                            labelId="position-filter-label"
                            id="position-filter"
                            value={positionFilters}
                            label="Positions"
                            input={<OutlinedInput size='small' label='Positions'/>}
                            renderValue={(selected) => selected.join(', ')}
                            onChange={handlePositionFilterChange}
                        >
                            {uniquePositions.map(position => (
                                <MenuItem key={position} value={position}>
                                    <Stack direction='row' alignItems='center'>
                                        <Checkbox sx={{paddingY: 0.5}} checked={positionFilters.includes(position)}/>
                                        <ListItemText primary={position}/>
                                    </Stack>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        </>
    )
}