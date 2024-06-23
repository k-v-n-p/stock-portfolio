import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { StockData } from '../../apis/stockApi';

export type StockDataState = {
  data: StockData;
};

const initialState: StockDataState = {
  data: {},
};

const stockDataSlice = createSlice({
  name: 'stockData',
  initialState,
  reducers: {
    setStockData(state, action: PayloadAction<StockData>) {
      state.data = action.payload;
    },
    clearStockData(state) {
      state.data = {};
    },
  },
});

export const { setStockData, clearStockData } = stockDataSlice.actions;

export default stockDataSlice.reducer;
