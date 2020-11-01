import { configureStore } from '@reduxjs/toolkit';
import clockReducer from './lib/slices/clockSlice';

export default configureStore({
    reducer: {
        clock: clockReducer,
    },
    devTools: true,
});
