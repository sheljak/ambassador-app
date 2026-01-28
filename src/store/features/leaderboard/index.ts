import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { LeaderboardState } from './types';
import type { LeaderboardAmbassador } from '../../types_that_will_used';

export const SLICE_KEY = 'leaderboard';

const initialState: LeaderboardState = {
  leaders: [],
  nextLeaders: [],
  currentAmbassador: null,
  total: 0,
  isLoading: false,
  error: null,
};

const leaderboardSlice = createSlice({
  name: SLICE_KEY,
  initialState,
  reducers: {
    setLeaderboardData: (
      state,
      action: PayloadAction<{
        leaders: LeaderboardAmbassador[];
        nextLeaders: LeaderboardAmbassador[];
        total: number;
      }>
    ) => {
      state.leaders = action.payload.leaders;
      state.nextLeaders = action.payload.nextLeaders;
      state.total = action.payload.total;
    },
    setCurrentAmbassador: (
      state,
      action: PayloadAction<LeaderboardAmbassador | null>
    ) => {
      state.currentAmbassador = action.payload;
    },
    appendNextLeaders: (
      state,
      action: PayloadAction<LeaderboardAmbassador[]>
    ) => {
      const existingIds = new Set(state.nextLeaders.map((item) => item.id));
      const newItems = action.payload.filter((item) => !existingIds.has(item.id));
      state.nextLeaders = [...state.nextLeaders, ...newItems];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetLeaderboard: () => initialState,
  },
});

export const {
  setLeaderboardData,
  setCurrentAmbassador,
  appendNextLeaders,
  setLoading,
  setError,
  resetLeaderboard,
} = leaderboardSlice.actions;

export const leaderboardReducer = leaderboardSlice.reducer;

// Selectors
export const leaderboardSelectors = {
  selectLeaders: (state: { [SLICE_KEY]: LeaderboardState }) =>
    state[SLICE_KEY].leaders,
  selectNextLeaders: (state: { [SLICE_KEY]: LeaderboardState }) =>
    state[SLICE_KEY].nextLeaders,
  selectCurrentAmbassador: (state: { [SLICE_KEY]: LeaderboardState }) =>
    state[SLICE_KEY].currentAmbassador,
  selectTotal: (state: { [SLICE_KEY]: LeaderboardState }) =>
    state[SLICE_KEY].total,
  selectIsLoading: (state: { [SLICE_KEY]: LeaderboardState }) =>
    state[SLICE_KEY].isLoading,
  selectError: (state: { [SLICE_KEY]: LeaderboardState }) =>
    state[SLICE_KEY].error,
};

// Re-export API hooks
export { useGetLeaderboardQuery, useLazyGetLeaderboardQuery } from './api';
