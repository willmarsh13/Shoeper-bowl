import React from 'react';
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from '@mui/material';
import StatInputCell from './StatInputCell';
import {StatDefinition} from '../logic/scoringStatDefinitions';

interface Entity {
    entityId: string;
    displayName: string;
    team?: string;
}

interface Props {
    entities: Entity[];
    stats: StatDefinition[];
    values: Record<string, Record<string, number>>;
    onChange: (entityId: string, statKey: string, value: number) => void;
}

export default function ScoringTable({
                                         entities,
                                         stats,
                                         values,
                                         onChange,
                                     }: Props) {
    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    {/* Top-left sticky cell */}
                    <TableCell
                        sx={{
                            position: 'sticky',
                            top: 0,
                            left: 0,
                            zIndex: 5,
                            backgroundColor: 'grey.900', // lighter background
                            borderRight: '1px solid',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        Player / Team
                    </TableCell>

                    {/* Stat headers */}
                    {stats.map(stat => (
                        <TableCell
                            key={stat.key}
                            align="center"
                            sx={{
                                position: 'sticky',
                                top: 0,
                                zIndex: 4,
                                backgroundColor: 'grey.900', // lighter background
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            {stat.label}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>

            <TableBody>
                {entities.map(entity => (
                    <TableRow key={entity.entityId}>
                        {/* Left sticky column */}
                        <TableCell
                            sx={{
                                position: 'sticky',
                                left: 0,
                                zIndex: 3,
                                backgroundColor: 'grey.900', // lighter background
                                borderRight: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            {entity.displayName}
                            {entity.team && ` (${entity.team})`}
                        </TableCell>

                        {stats.map(stat => (
                            <TableCell key={stat.key} align="center">
                                <StatInputCell
                                    value={values[entity.entityId]?.[stat.key]}
                                    onChange={(val) =>
                                        onChange(entity.entityId, stat.key, val)
                                    }
                                />
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
