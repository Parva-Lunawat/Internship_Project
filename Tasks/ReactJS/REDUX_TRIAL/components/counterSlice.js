import { createSlice } from "@reduxjs/toolkit";

export const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 19, initial: 19 },
  reducers: {
    increment: (state, action) => {
      const n = Number(action.payload ?? 1);
      state.value += Number.isFinite(n) ? n : 1;
    },
    decrement: (state, action) => {
      const n = Number(action.payload ?? 1);
      state.value -= Number.isFinite(n) ? n : 1;
    },
    multiplier: (state, action) => {
      const n = Number(action.payload ?? 1);
      if (!Number.isFinite(n)) return;
      state.value *= n;
    },
    exponential: (state, action) => {
      const n = Number(action.payload ?? 2);
      if (!Number.isFinite(n)) return;
      state.value = state.value ** n;
    },
    squareRoot: (state, action) => {
      const n = Number(action.payload ?? 2);
      if (!Number.isFinite(n) || n === 0) return;
      state.value = state.value ** (1 / n);
    },
    resetValue: (state, action) => {
      // If payload is missing/empty => reset to initial
      const payload = action.payload;

      if (payload === undefined || payload === null || payload === "") {
        state.value = state.initial;
        return;
      }

      const n = Number(payload);
      if (!Number.isFinite(n)) return;
      state.value = n;
      state.initial = n;
    },
  },
});

export const {
  increment,
  decrement,
  multiplier,
  exponential,
  squareRoot,
  resetValue,
} = counterSlice.actions;

export const selectCount = (state) => state.counter.value;

export default counterSlice.reducer;
