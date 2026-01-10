import * as React from 'react';
import {
    DataGrid,
    GridColDef,
    GridCellModes,
    GridCellModesModel,
    GridCellParams,
    GridRowsProp,
    GridEventListener,
} from '@mui/x-data-grid';
import {Box} from '@mui/material';
import {StatDefinition} from '../logic/scoringStatDefinitions';
import {useEffect} from "react";
import {CustomToolbar} from "./CustomToolbar";

interface Props {
    entities: any[];
    stats: StatDefinition[];
    getInitialValue: (entityId: string, statKey: string) => number | undefined;
    onChange: (entityId: string, statKey: string, value: number) => void;
}

export const ScoringDataGrid = ({entities, stats, getInitialValue, onChange}: Props) => {
    const [cellModesModel, setCellModesModel] = React.useState<GridCellModesModel>({});

    /** Handle single-click edit */
    const handleCellClick = React.useCallback(
        (params: GridCellParams) => {
            if (!params.colDef.editable) return;

            setCellModesModel(prev => {
                const newModel: GridCellModesModel = {};
                Object.keys(prev).forEach(rowId => {
                    newModel[rowId] = {};
                    Object.keys(prev[rowId]).forEach(field => {
                        newModel[rowId][field] = {mode: GridCellModes.View};
                    });
                });

                newModel[params.id] = {
                    ...(newModel[params.id] || {}),
                    [params.field]: {mode: GridCellModes.Edit},
                };
                return newModel;
            });
        },
        []
    );

    const handleCellModesModelChange = React.useCallback(
        (newModel: GridCellModesModel) => setCellModesModel(newModel),
        []
    );

    const handleCellEditStop: GridEventListener<'cellEditStop'> = (params, event) => {
        const value = Number(params.value ?? 0);
        const current = getInitialValue(params.id as string, params.field);
        const currentNormalized = current ?? 0;

        if (value !== currentNormalized) {
            onChange(params.id as string, params.field, value);
        }

        // Tab navigation
        const keyboardEvent = event as unknown as React.KeyboardEvent;
        if (keyboardEvent?.key === 'Tab') {
            event.defaultMuiPrevented = true;

            const rowIndex = entities.findIndex(e => e.entityId === params.id);
            const colIndex = stats.findIndex(s => s.key === params.field);
            if (rowIndex === -1 || colIndex === -1) return;

            let nextRow = rowIndex;
            let nextCol = colIndex;

            if (keyboardEvent.shiftKey) {
                nextCol--;
                if (nextCol < 0) {
                    nextRow--;
                    nextCol = stats.length - 1;
                }
            } else {
                nextCol++;
                if (nextCol >= stats.length) {
                    nextRow++;
                    nextCol = 0;
                }
            }

            if (nextRow < 0 || nextRow >= entities.length) return;

            const nextId = entities[nextRow].entityId;
            const nextField = stats[nextCol].key;

            setCellModesModel(prev => ({
                ...prev,
                [nextId]: {
                    ...(prev[nextId] || {}),
                    [nextField]: {mode: GridCellModes.Edit},
                },
            }));
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Name',
            width: 220,
            editable: false,
        },
        ...stats.map(stat => ({
            field: stat.key,
            headerName: stat.label || stat.key,
            width: 120,
            editable: true,
        })),
    ];

    // Rows
    const rows: GridRowsProp = entities.map(e => ({
        id: e.entityId,
        name: e.displayName,
        ...Object.fromEntries(stats.map(s => [s.key, getInitialValue(e.entityId, s.key) ?? 0])),
    }));

    return (
        <Box sx={{height: '100%', width: '100%'}}>
            <DataGrid
                rows={rows}
                columns={columns}
                density="compact"
                disableColumnMenu
                hideFooter
                autoHeight={false}
                cellModesModel={cellModesModel}
                onCellModesModelChange={handleCellModesModelChange}
                onCellClick={handleCellClick}
                onCellEditStop={handleCellEditStop}
                slots={{toolbar: CustomToolbar}}
                showToolbar
            />
        </Box>
    );
};
