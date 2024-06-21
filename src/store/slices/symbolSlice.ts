import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type SymbolState ={
  symbols: string[];
}

const initialState: SymbolState = {
  symbols: [], 
};

const symbolSlice = createSlice({
  name: 'symbols',
  initialState,
  reducers: {
    setSymbols(state, action: PayloadAction<string[]>) {
      state.symbols = action.payload;
    },
    addSymbol(state, action: PayloadAction<string>) {
      state.symbols.push(action.payload);
    },
    removeSymbol(state, action: PayloadAction<string>) {
      state.symbols = state.symbols.filter(symbol => symbol !== action.payload);
    },
    clearSymbols(state) {
      state.symbols = [];
    },
  },
});

export const { setSymbols, addSymbol, removeSymbol, clearSymbols } = symbolSlice.actions;

export default symbolSlice.reducer;
