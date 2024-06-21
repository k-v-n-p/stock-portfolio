// src/services/finnhubApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_KEY = process.env.REACT_APP_FinnHub_Api!;
// src/apis/stockApi.ts
export type SymbolsType = string[];

export type symbolData = {
  symbol: string;
};
export type stockInfo = {
  logo: string;
  name: string;
  sector: string;
};
export type stockPrice = {
  currentPrice: number;
};

// Define an API service using a base URL and expected endpoints
export const stockApi = createApi({
  reducerPath: 'stockApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://finnhub.io/api/v1' }),
  endpoints: (build) => ({
    // Endpoint to fetch stock symbols
    getStockSymbols: build.query<symbolData[], void>({
      query: () => `stock/symbol?exchange=US&token=${API_KEY}`,
      transformResponse: (response: any[]) => response.map(res => (
        res.symbol
        // {
        // symbol: res.symbol,
        // name: res.description
        // }
      )),
    }),
    getStockProfile: build.query<stockInfo, string >({
      query: (symbol) => `profile2?symbol=${symbol}&token=${API_KEY}`,
      transformResponse: (response: any) => ({
        logo: response.logo,
        name: response.name,
        sector: response.finnhubIndustry
      }),
    }),
    // Endpoint to subscribe to real-time updates for a specific stock symbol
    subscribeToStock: build.query<stockPrice, string>({
      query: (symbol) => `wss://ws.finnhub.io?token=${API_KEY}&symbol=${symbol}`,
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        // Create a WebSocket connection when the cache subscription starts
        const ws = new WebSocket(`wss://ws.finnhub.io?token=${API_KEY}&symbol=${arg}`);

        try {
          // Wait for the initial query to resolve before proceeding
          await cacheDataLoaded;

          // Listener to update cached data when messages are received from the WebSocket
          const listener = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data && typeof data === 'object' && 'c' in data) {
              const { c: currentPrice } = data;
              updateCachedData((draft) => {
                draft.currentPrice = currentPrice;
              });
            }
          };

          ws.addEventListener('message', listener);
        } catch {
          // No-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
          // in which case `cacheDataLoaded` will throw
        }

        // Perform cleanup steps once the `cacheEntryRemoved` promise resolves
        await cacheEntryRemoved;
        ws.close();
      },
    }),
  }),
});

export const { useGetStockSymbolsQuery, useLazySubscribeToStockQuery, useLazyGetStockProfileQuery} = stockApi;
