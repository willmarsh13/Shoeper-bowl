import * as React from 'react';
import {
    DataGrid,
    GridColDef,
    GridRowsProp,
    GridEventListener,
    useGridApiRef,
} from '@mui/x-data-grid';
import {Box, Stack, Tooltip, Typography} from '@mui/material';
import {StatDefinition} from '../logic/scoringStatDefinitions';
import {CustomToolbar} from "./CustomToolbar";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
    entities: any[];
    stats: StatDefinition[];
    getInitialValue: (entityId: string, statKey: string) => number | undefined;
    onChange: (entityId: string, statKey: string, value: number) => void;
}

export const ScoringDataGrid = ({
                                    entities,
                                    stats,
                                    getInitialValue,
                                    onChange,
                                }: Props) => {

    const apiRef = useGridApiRef();

    const handleCellEditStop: GridEventListener<'cellEditStop'> = (params, event) => {
        const keyboardEvent = event as React.KeyboardEvent;
        if (keyboardEvent.key !== 'Tab') return;

        event.defaultMuiPrevented = true;

        const rowIndex = entities.findIndex(e => e.entityId === params.id);
        const colIndex = stats.findIndex(s => s.key === params.field);

        if (rowIndex === -1 || colIndex === -1) return;

        let nextRow = rowIndex;
        let nextCol = colIndex + (keyboardEvent.shiftKey ? -1 : 1);

        if (nextCol >= stats.length) {
            nextCol = 0;
            nextRow++;
        } else if (nextCol < 0) {
            nextCol = stats.length - 1;
            nextRow--;
        }

        if (nextRow < 0 || nextRow >= entities.length) return;

        const nextRowId = entities[nextRow].entityId;
        const nextField = stats[nextCol].key;

        apiRef?.current?.setCellFocus(nextRowId, nextField);
        apiRef?.current?.startCellEditMode({
            id: nextRowId,
            field: nextField,
        });
    };

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Name',
            width: 220,
            editable: false,
            renderCell: (params) => {
                const entity = entities.find(e => e.entityId === params.id);
                const hasData = entity && entity.scores && Object.keys(entity.scores).length > 0;

                const tooltipText = entity
                    ?
                    <Stack>
                        <Typography variant='body2'>
                            <b>{`Last updated:`}</b>{` ${entity.updatedAt ? new Date(entity.updatedAt).toLocaleString() : 'N/A'}`}
                        </Typography>
                        <Typography variant='body2'>
                            <b>{`Drafted by:`}</b>{` ${entity.draftCount || 0} user(s)`}
                        </Typography>
                    </Stack>
                    : '';

                return (
                    <Tooltip title={tooltipText}>
                        <Stack sx={{height: '100%', display: 'flex', alignItems: 'center'}} direction='row' spacing={1}>
                            {!hasData &&
                                <Tooltip title="Player has no data for this round">
                                    <ErrorOutlineIcon color="warning" fontSize="small"/>
                                </Tooltip>
                            }
                            <Typography>{params.value}</Typography>
                        </Stack>
                    </Tooltip>
                );
            },
            description: 'Hover for last update & drafted count',
        },
        ...stats.map(stat => ({
            field: stat.key,
            headerName: stat.label || stat.key,
            width: 120,
            editable: true,
        })),
    ];

    const rows: GridRowsProp = entities.map(e => ({
        id: e.entityId,
        name: e.displayName,
        ...Object.fromEntries(
            stats.map(s => [s.key, e.scores?.[s.key] ?? 0])
        ),
        updatedAt: e.updatedAt,
        draftCount: e.draftCount,
    }));

    const processRowUpdate = React.useCallback(
        (newRow: any, oldRow: any) => {
            stats.forEach(stat => {
                const key = stat.key;
                const newValue = Number(newRow[key] ?? 0);
                const oldValue = Number(oldRow[key] ?? 0);

                if (newValue !== oldValue) {
                    onChange(newRow.id, key, newValue);
                }
            });

            return newRow;
        },
        [stats, onChange]
    );

    return (
        <Box sx={{height: '100%', width: '100%'}}>
            <DataGrid
                apiRef={apiRef}
                rows={rows}
                columns={columns}
                initialState={{
                    density: 'compact'
                }}
                disableColumnMenu
                hideFooter
                autoHeight={false}
                onCellEditStop={handleCellEditStop}
                processRowUpdate={processRowUpdate}
                slots={{toolbar: CustomToolbar}}
                showToolbar
            />
        </Box>
    );
};
