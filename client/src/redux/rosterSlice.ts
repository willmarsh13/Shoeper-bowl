import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {PlayoffRound, ROUND_CONFIG, RoundConfig} from "../pages/BuildTeam/logic/roundRules";
import {Player, Position} from "../Interfaces/Player";

export type RoundType = PlayoffRound;

export interface RosterSlot {
    slotId: string;       // e.g., 'RB1'
    position: Position; // e.g., 'RB'
    player?: Player | null;
}

interface RosterState {
    slots: RosterSlot[];
    round: RoundType;
}

// ----------------- Dynamic Slot Generation -----------------
export const generateSlots = (round: RoundType): RosterSlot[] => {
    const config: RoundConfig = ROUND_CONFIG[round];
    const counts: Record<string, number> = {};

    return config?.allowedPositions?.map(pos => {
        counts[pos] = (counts[pos] || 0) + 1;
        return {
            slotId: counts[pos] > 1 ? `${pos}${counts[pos]}` : pos,
            position: pos as Position,
            player: null,
        };
    });
};

const initialState: RosterState = {
    slots: generateSlots('WILD_CARD'),
    round: 'WILD_CARD',
};

// ----------------- Slice -----------------
const rosterSlice = createSlice({
    name: 'roster',
    initialState,
    reducers: {
        setRound(state, action: PayloadAction<RoundType>) {
            state.round = action.payload;
            // regenerate slots for the new round
            state.slots = generateSlots(action.payload);
        },

        placePlayerAuto(state, action: PayloadAction<{ player: Player | null }>) {
            const {player} = action.payload;
            if (!player) return;

            const config = ROUND_CONFIG[state.round];

            const teamCount = state.slots.filter(s => s.player?.team === player.team).length;

            const slot = state.slots.find(s => s.position === player.position && !s.player);
            if (slot) slot.player = player;
        },

        removePlayerFromSlot(state, action: PayloadAction<{ slotId: string }>) {
            const slot = state.slots.find(s => s.slotId === action.payload.slotId);
            if (slot) slot.player = null;
        },

        resetRoster(state) {
            state.slots = generateSlots(state.round);
        },

        setRosterFromApi(
            state,
            action: PayloadAction<{
                round: RoundType;
                roster: RosterSlot[];
            }>
        ) {
            const {round, roster} = action.payload;

            state.round = round;

            const baseSlots = generateSlots(round);

            state.slots = baseSlots?.map(slot => {
                const apiSlot = roster?.find(r => r.slotId === slot.slotId);

                return apiSlot
                    ? {
                        ...slot,
                        player: apiSlot.player ?? null,
                    }
                    : slot;
            });
        },

    },
});

export const {
    setRound,
    placePlayerAuto,
    removePlayerFromSlot,
    resetRoster,
    setRosterFromApi,
} = rosterSlice.actions;

export default rosterSlice.reducer;