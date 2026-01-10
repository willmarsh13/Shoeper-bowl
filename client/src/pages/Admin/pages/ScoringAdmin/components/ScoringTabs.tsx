import { Tab, Tabs } from '@mui/material';
import React from 'react';
import { ScoringCategory } from '../logic/scoringStatDefinitions';

interface Props {
    tab: ScoringCategory;
    onTabChange: (tab: ScoringCategory) => void;
}

export default function ScoringTabs({ tab, onTabChange }: Props) {
    return (
        <Tabs value={tab} onChange={(_, v) => onTabChange(v)}>
            <Tab value="offense" label="Offense" />
            <Tab value="dst" label="Defense / ST" />
            <Tab value="kicker" label="Kicking" />
        </Tabs>
    );
}
