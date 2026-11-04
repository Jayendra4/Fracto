import { createSlice } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark';

interface ModeState {
  theme: ThemeMode;
}

const getInitialTheme = (): ThemeMode => {
  const saved = localStorage.getItem('hof_theme') as ThemeMode | null;
  if (saved === 'light' || saved === 'dark') return saved;

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

const initialState: ModeState = {
  theme: getInitialTheme(),
};

const modeSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('hof_theme', state.theme);
    },
    setTheme(state, action: { payload: ThemeMode }) {
      state.theme = action.payload;
      localStorage.setItem('hof_theme', action.payload);
    },
  },
});

export const { toggleTheme, setTheme } = modeSlice.actions;
export default modeSlice.reducer;
