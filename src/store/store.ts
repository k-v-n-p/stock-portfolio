// src/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { stockApi } from '../apis/stockApi';
import symbolReducer from './slices/symbolSlice';
import stockDataReducer from './slices/stockDataSlice'

export const store = configureStore({
  reducer: {
    [stockApi.reducerPath]: stockApi.reducer,
    symbol: symbolReducer,
    stockData: stockDataReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(stockApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
