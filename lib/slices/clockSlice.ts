import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ClockState {
    lastUpdate: number;
    light: boolean;
}

const clockSlice = createSlice({
    name: 'clock',
    initialState: {
        lastUpdate: 0,
        light: true,
    },
    reducers: {
        tick: (state, action: PayloadAction<ClockState>) => {
            /* eslint-disable no-param-reassign */
            state.lastUpdate = action.payload.lastUpdate;
            state.light = Boolean(action.payload.light);
            /* eslint-enable no-param-reassign */
        },
    },
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return,@typescript-eslint/explicit-module-boundary-types
export const selectClock = (state: any): ClockState => state.clock;

export const { tick } = clockSlice.actions;

export default clockSlice.reducer;
