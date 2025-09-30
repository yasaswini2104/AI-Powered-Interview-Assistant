// client\src\app\store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit'; 
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import interviewReducer from '../features/interviewSlice';
import candidatesReducer from '../features/candidatesSlice'; 
// Combine the reducers
const rootReducer = combineReducers({
  interview: interviewReducer,
  candidates: candidatesReducer, 
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['interview'],
};

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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

