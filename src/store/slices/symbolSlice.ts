import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { clear } from 'console';

type SymbolState ={
  symbols: string[];
  selectedSymbols: string[];
}

const initialState: SymbolState = {
  symbols: [], 
  selectedSymbols: []
};

const symbolSlice = createSlice({
  name: 'symbols',
  initialState,
  reducers: {
    setSymbols(state, action: PayloadAction<string[]>) {
      console.log("got action", action)
      state.symbols = action.payload;
    },
    clearSymbols(state) {
      state.symbols = [];
    },
    setSelectedSymbols(state, action: PayloadAction<string[]>) {
      state.selectedSymbols = action.payload;
    },
    removeSelectedSymbol(state, action: PayloadAction<string>) {
      state.selectedSymbols = state.selectedSymbols.filter(symbol => symbol !== action.payload);
    },
    addSelectedSymbol(state, action: PayloadAction<string>) {
      state.selectedSymbols.push(action.payload);
    },
    clearSelectedSymbols(state) {
      state.selectedSymbols = [];
    },
  }
});

export const { 
  setSymbols, 
  clearSymbols, 
  addSelectedSymbol, 
  setSelectedSymbols,
  removeSelectedSymbol,
  clearSelectedSymbols,
 } = symbolSlice.actions;

export default symbolSlice.reducer;
