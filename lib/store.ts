import { configureStore } from '@reduxjs/toolkit';

import clockReducer from './slices/clockSlize';

export default configureStore({
    reducer: {
        clock: clockReducer,
    },
    devTools: true,
});
