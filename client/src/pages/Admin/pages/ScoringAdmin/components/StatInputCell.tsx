import React from 'react';
import { TextField } from '@mui/material';

interface Props {
    value?: number;
    onChange: (value: number) => void;
}

export default function StatInputCell({ value, onChange }: Props) {
    return (
        <TextField
            type="number"
            size="small"
            value={value ?? 0}
            inputProps={{ min: 0 }}
            onChange={(e) => onChange(Number(e.target.value))}
            sx={{ width: 80 }}
        />
    );
}
