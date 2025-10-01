// client\src\app\store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit'; 
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../features/authSlice';
import interviewReducer from '../features/interviewSlice';
import candidatesReducer from '../features/candidatesSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  interview: interviewReducer,
  candidates: candidatesReducer, 
});

const persistConfig = {
  key: 'root',
  storage,
  // We only want to persist the 'interview' slice for session resumption.
  // 'auth' is handled by localStorage directly in its slice.
  whitelist: ['interview'],
};

// 2. We create the persisted reducer.
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer, 
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

// 3. We define our RootState based on the ORIGINAL, un-persisted rootReducer.
// This gives us the clean state type that our components expect.
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

