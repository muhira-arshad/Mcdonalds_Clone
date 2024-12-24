import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OfflineState {
  isOffline: boolean;
  pendingActions: any[];
}

const initialState: OfflineState = {
  isOffline: false,
  pendingActions: [],
};

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOfflineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
    addPendingAction: (state, action: PayloadAction<any>) => {
      state.pendingActions.push(action.payload);
    },
    clearPendingActions: (state) => {
      state.pendingActions = [];
    },
  },
});

export const { setOfflineStatus, addPendingAction, clearPendingActions } = offlineSlice.actions;
export default offlineSlice.reducer;