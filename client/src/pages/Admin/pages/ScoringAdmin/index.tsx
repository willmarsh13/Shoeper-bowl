import React, {
    useEffect,
    useState,
    useMemo,
    useRef,
    useCallback,
} from "react";
import {
    Box,
    CircularProgress,
    Typography,
    Button,
    Select,
    MenuItem,
} from "@mui/material";
import { getURL } from "../../../../Shared/getURL";
import ScoringTabs from "./components/ScoringTabs";
import {
    ScoringCategory,
    STAT_DEFINITIONS,
} from "./logic/scoringStatDefinitions";
import checkUnauthorized from "../../../../Shared/handleCheckUnauth";
import debounce from "lodash/debounce";
import { ScoringDataGrid } from "./components/ScoringDataGrid";
import {ROUND_CONFIG, RoundConfig} from "../../../BuildTeam/logic/roundRules";

interface DataInt {
    offense: any[];
    dst: any[];
    kicker: any[];
}

export default function ScoringAdmin() {
    const [data, setData] = useState<DataInt>({
        offense: [],
        dst: [],
        kicker: [],
    });
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<ScoringCategory>("offense");

    const [rounds, setRounds] = useState<RoundConfig[]>([]);
    const [round, setRound] = useState<string>("");

    const [values, setValues] = useState<Record<string, Record<string, number>>>({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isAutosaving, setIsAutosaving] = useState(false);
    const [saving, setSaving] = useState(false);

    const roundRef = useRef<string>("");
    const dirtyRef = useRef<Record<string, Record<string, number>>>({});

    useEffect(() => {
        setRounds(Object.values(ROUND_CONFIG));
    }, []);

    /*
        Fetch scores for a specific round
    */
    const fetchScores = useCallback(async (targetRound?: string) => {
        setLoading(true);

        const res = await fetch(
            `${getURL()}/api/scores${targetRound ? `?round=${targetRound}` : ""}`,
            { credentials: "include" }
        );
        const json = await res.json();

        checkUnauthorized(json.status);

        const results = json.results;

        setData({
            offense: results.offense,
            kicker: results.kicker,
            dst: results.dst,
        });

        setRound(results.round);
        roundRef.current = results.round; // ✅ critical line

        const initialValues: Record<string, Record<string, number>> = {};
        ["offense", "kicker", "dst"].forEach(cat => {
            results[cat].forEach((entity: any) => {
                initialValues[entity.entityId] = {
                    ...(entity.scores ?? {}),
                };
            });
        });

        setValues(initialValues);
        dirtyRef.current = {};
        setHasUnsavedChanges(false);
        setLoading(false);
    }, []);


    /*
        Initial load + round list
    */
    useEffect(() => {
        const init = async () => {
            const info = await fetch(`${getURL()}/api/game/info`, {
                credentials: "include",
            }).then(r => r.json());

            await fetchScores(info.round);
        };

        init();
    }, [fetchScores]);

    /*
        Handle stat edits
    */
    const handleChange = useCallback(
        (entityId: string, statKey: string, value: number) => {
            setValues(prev => ({
                ...prev,
                [entityId]: {
                    ...prev[entityId],
                    [statKey]: value,
                },
            }));

            dirtyRef.current[entityId] = {
                ...dirtyRef.current[entityId],
                [statKey]: value,
            };

            setHasUnsavedChanges(true);
            debouncedSave();
        },
        []
    );

    /*
        Save changes for the current round
    */
    const saveChanges = useCallback(async () => {
        if (!Object.keys(dirtyRef.current).length) return;

        setIsAutosaving(true);
        setSaving(true);

        await fetch(`${getURL()}/api/Admin/Scoring`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                round: roundRef.current, // ✅ always correct
                changes: dirtyRef.current,
            }),
        });

        dirtyRef.current = {};
        setHasUnsavedChanges(false);
        setSaving(false);
        setIsAutosaving(false);
    }, []);


    const debouncedSave = useRef(debounce(saveChanges, 5000)).current;

    const sortedEntities = useMemo(() => {
        const currentTabData = Array.isArray(data?.[tab]) ? data[tab] : [];
        return [...currentTabData]
            .sort((a, b) => a.displayName.localeCompare(b.displayName))
            .map(entity => ({
                ...entity,
                scores: values[entity.entityId] ?? {},
            }));
    }, [data, tab, values]);

    if (loading) {
        return (
            <Box
                height="100%"
                width="100%"
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4">Scoring Admin</Typography>

                <Select
                    size="small"
                    value={round}
                    onChange={e => fetchScores(e.target.value)}
                >
                    {rounds?.map((r: RoundConfig) => (
                        <MenuItem key={r.key} value={r.key}>
                            {r.displayName}
                        </MenuItem>
                    ))}
                </Select>
            </Box>

            <ScoringTabs tab={tab} onTabChange={setTab} />

            <Box sx={{ flex: 1, minHeight: 0 }}>
                <ScoringDataGrid
                    entities={sortedEntities}
                    stats={STAT_DEFINITIONS[tab] ?? []}
                    onChange={handleChange}
                />
            </Box>

            {hasUnsavedChanges && (
                <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button
                        variant="contained"
                        disabled={saving}
                        onClick={saveChanges}
                    >
                        {isAutosaving ? "Autosaving" : "Save Now"}
                    </Button>
                </Box>
            )}
        </Box>
    );
}
