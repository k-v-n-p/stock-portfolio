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
export type StockData = {
  [symbol: string]: {
    logo: string;
    name: string;
    sector: string;
    currentPrice: number;
  };
};
type StockProfileResponse ={
  logo: string;
  name: string;
  finnhubIndustry: string;
};
type StockPriceResponse = {
  c: number;
};

// Define an API service using a base URL and expected endpoints
export const stockApi = createApi({
  reducerPath: 'stockApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://finnhub.io/api/v1' }),
  endpoints: (build) => ({

    // Endpoint to fetch stock symbols
    getStockSymbols: build.query<symbolData[], void>({
      query: () => `stock/symbol?exchange=US&token=${API_KEY}&mic=XNAS`,
      transformResponse: (response: any[]) => response.map(res => (
        res.symbol
        // {
        // symbol: res.symbol,
        // name: res.description
        // }
      )),
    }),

    getStockProfile: build.query<stockInfo, string >({
      query: (symbol) => `stock/profile2?symbol=${symbol}&token=${API_KEY}`,
      transformResponse: (response: any) => ({
        logo: response.logo,
        name: response.name,
        sector: response.finnhubIndustry
      }),
    }),

    getStockPrice: build.query<stockPrice, string >({
      query: (symbol) => `quote?symbol=${symbol}&token=${API_KEY}`,
      transformResponse: (response: any) => ({
        currentPrice: response.c,
      }),
    }),
    
    getStockData: build.query<StockData, string[]>({
      queryFn: async (symbols, _queryApi, _extraOptions, fetchWithBQ) => {
        try {
          const profilePromises = symbols.map(symbol => fetchWithBQ(`stock/profile2?symbol=${symbol}&token=${API_KEY}`));
          const pricePromises = symbols.map(symbol => fetchWithBQ(`quote?symbol=${symbol}&token=${API_KEY}`));
          
          const profileResponses = await Promise.all(profilePromises);
          const priceResponses = await Promise.all(pricePromises);

          const data = symbols.reduce((acc, symbol, index) => {
            const profileResponse = profileResponses[index].data as StockProfileResponse;
            const priceResponse = priceResponses[index].data as StockPriceResponse;

            acc[symbol] = {
              logo: profileResponse.logo || "https://static.finnhub.io/logo/87cb30d8-80df-11ea-8951-00000000092a.png",
              name: profileResponse.name || symbol,
              sector: profileResponse.finnhubIndustry || "Unknown",
              currentPrice: priceResponse.c,
            };
            return acc;
          }, {} as StockData);
          console.log("Data",data)
          return {data};
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: 'Something went wrong' } };
        }
      },
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

export const { useGetStockSymbolsQuery, useSubscribeToStockQuery, useLazyGetStockProfileQuery, useLazyGetStockDataQuery} = stockApi;
