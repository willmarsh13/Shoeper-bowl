import React, {useEffect, useState, useMemo, useRef, useCallback} from 'react';
import {Box, CircularProgress, Typography, Button} from '@mui/material';
import {getURL} from "../../../../Shared/getURL";
import ScoringTabs from "./components/ScoringTabs";
import {ScoringCategory, STAT_DEFINITIONS} from "./logic/scoringStatDefinitions";
import ScoringTable from "./components/ScoringTable";
import checkUnauthorized from "../../../../Shared/handleCheckUnauth";
import debounce from 'lodash/debounce';

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
    // Tracks only changed values for autosave
    const [changedValues, setChangedValues] = useState<Record<string, Record<string, number>>>({});
    const [saving, setSaving] = useState(false);

    // Fetch initial data
    useEffect(() => {
        const fetchScores = async () => {
            try {
                const json = await fetch(`${getURL()}/api/Admin/Scoring`, {
                    credentials: 'include',
                }).then(res => res.json());

                checkUnauthorized(json.status);
                setData(json.results);

                // Initialize values with fetched data
                const initialValues: Record<string, Record<string, number>> = {};
                Object.keys(json.results).forEach(cat => {
                    json.results[cat].forEach((entity: any) => {
                        initialValues[entity.entityId] = {...entity.stats};
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

    // Sort entities once on load
    const sortedEntities = useMemo(() => {
        const currentTabData = data?.[tab] ?? [];
        return [...currentTabData].sort((a, b) => {
            const aMissing = STAT_DEFINITIONS[tab].filter(s => !(values[a.entityId]?.[s.key] ?? 0)).length;
            const bMissing = STAT_DEFINITIONS[tab].filter(s => !(values[b.entityId]?.[s.key] ?? 0)).length;
            return bMissing - aMissing;
        });
    }, [data, tab, values]);

    // Handle table input changes
    const handleChange = (entityId: string, statKey: string, value: number) => {
        setValues(prev => ({
            ...prev,
            [entityId]: {...prev[entityId], [statKey]: value},
        }));
        setChangedValues(prev => ({
            ...prev,
            [entityId]: {...prev[entityId], [statKey]: value},
        }));
    };

    // Debounced save function
    const saveChanges = useCallback(async () => {
        if (Object.keys(changedValues).length === 0) return;

        setSaving(true);
        try {
            const payload = {changes: changedValues};
            await fetch(`${getURL()}/api/Admin/Scoring/Update`, {
                method: 'POST',
                credentials: 'include',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });

            // Clear changedValues on successful save
            setChangedValues({});
        } catch (err) {
            console.error('Failed to save scoring changes', err);
        } finally {
            setSaving(false);
        }
    }, [changedValues]);

    // Autosave after 5 seconds of inactivity
    const debouncedSave = useRef(debounce(saveChanges, 5000)).current;

    useEffect(() => {
        if (Object.keys(changedValues).length > 0) {
            debouncedSave();
        }
    }, [changedValues, debouncedSave]);

    if (loading) {
        return (
            <Box height='100%' width='100%' sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <Box sx={{height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0}} pb={2}>
            <Typography variant="h4" gutterBottom>
                Scoring Admin
            </Typography>

            <ScoringTabs tab={tab} onTabChange={setTab}/>

            <Box sx={{flex: 1, minHeight: 0, overflow: 'auto'}}>
                <ScoringTable
                    entities={sortedEntities}
                    stats={STAT_DEFINITIONS[tab]}
                    values={values}
                    onChange={handleChange}
                />
            </Box>

            <Box sx={{mt: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2}}>
                {saving && <Typography variant="body2">Saving...</Typography>}
                <Button variant="contained" color="primary" onClick={saveChanges}
                        disabled={saving || Object.keys(changedValues).length === 0}>
                    Save Now
                </Button>
            </Box>
        </Box>
    );
}
