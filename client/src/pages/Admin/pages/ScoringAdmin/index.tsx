import React, {useEffect, useState, useMemo, useRef, useCallback} from 'react';
import {Box, CircularProgress, Typography, Button} from '@mui/material';
import {getURL} from '../../../../Shared/getURL';
import ScoringTabs from './components/ScoringTabs';
import {ScoringCategory, STAT_DEFINITIONS} from './logic/scoringStatDefinitions';
import checkUnauthorized from '../../../../Shared/handleCheckUnauth';
import debounce from 'lodash/debounce';
import {ScoringDataGrid} from './components/ScoringDataGrid';

interface DataInt {
    offense: any[];
    dst: any[];
    kicker: any[];
}

export default function ScoringAdmin() {
    const [data, setData] = useState<DataInt>({offense: [], dst: [], kicker: []});
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<ScoringCategory>('offense');

    // Holds all table values
    const [values, setValues] = useState<Record<string, Record<string, number>>>({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isAutosaving, setIsAutosaving] = useState(false);
    const [saving, setSaving] = useState(false);

    const valuesRef = useRef<Record<string, Record<string, number>>>({});
    const dirtyRef = useRef<Record<string, Record<string, number>>>({});

    useEffect(() => {
        valuesRef.current = values;
    }, [values]);

    // Fetch initial data
    useEffect(() => {
        const fetchScores = async () => {
            try {
                const json = await fetch(`${getURL()}/api/scores`, {
                    credentials: 'include',
                }).then(res => res.json());

                checkUnauthorized(json.status);
                setData(json.results);

                // Initialize values
                const initialValues: Record<string, Record<string, number>> = {};
                Object.keys(json.results).forEach(cat => {
                    json.results[cat].forEach((entity: any) => {
                        initialValues[entity.entityId] = {...(entity.scores ?? {})};
                    });
                });
                setValues(initialValues);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchScores();
    }, []);

    const getInitialValue = useCallback(
        (entityId: string, statKey: string) => values[entityId]?.[statKey] ?? 0,
        [values]
    );

    const sortedEntities = useMemo(() => {
        const currentTabData = data?.[tab] ?? [];
        return [...currentTabData]
            .sort((a, b) => a.displayName.localeCompare(b.displayName))
            .map(entity => ({
                ...entity,
                // merge current values into scores
                scores: values[entity.entityId] ?? entity.scores ?? {},
            }));
    }, [data, tab, values]);

    // Handle table changes
    const handleChange = useCallback((entityId: string, statKey: string, value: number) => {
        setValues(prev => {
            const updated = {
                ...prev,
                [entityId]: {
                    ...prev[entityId],
                    [statKey]: value,
                },
            };
            // Track dirty fields for autosave
            dirtyRef.current[entityId] = {
                ...dirtyRef.current[entityId],
                [statKey]: value,
            };
            setHasUnsavedChanges(true);
            return updated;
        });

        debouncedSave();
    }, []);


    // Autosave function
    const saveChanges = useCallback(async () => {
        const changes = dirtyRef.current;
        if (!Object.keys(changes).length) return;

        setIsAutosaving(true);
        setSaving(true);

        try {
            await fetch(`${getURL()}/api/Admin/Scoring`, {
                method: 'POST',
                credentials: 'include',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({changes}),
            });

            dirtyRef.current = {};
            setHasUnsavedChanges(false);
        } finally {
            setSaving(false);
            setIsAutosaving(false);
        }
    }, []);

    const debouncedSave = useRef(debounce(saveChanges, 5000)).current;

    if (loading) {
        return (
            <Box height="100%" width="100%" sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <Box sx={{height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0}}>
            <Typography variant="h4" gutterBottom>
                Scoring Admin
            </Typography>

            <ScoringTabs tab={tab} onTabChange={setTab}/>

            <Box sx={{flex: 1, minHeight: 0}}>
                <ScoringDataGrid
                    entities={sortedEntities}
                    stats={STAT_DEFINITIONS[tab]}
                    getInitialValue={getInitialValue}
                    onChange={handleChange}
                />
            </Box>

            <Box sx={{mt: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2}}>
                {hasUnsavedChanges && (
                    <Button variant="contained" color="primary" disabled={saving} onClick={saveChanges}>
                        {isAutosaving ? 'Autosaving' : 'Save Now'}
                    </Button>
                )}
            </Box>
        </Box>
    );
}
