import { createSlice } from "@reduxjs/toolkit";
import AuthService from "@/services/modules/auth.service";

const initialState = {
  user: AuthService.getUser(),
  token: AuthService.getToken(),
  isAuthenticated: AuthService.isAuthenticated(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      state.loading = false;
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    logout: (state) => {
      AuthService.logout();

      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
    },
  },
});

export const { setLoading, setUser, setError, logout } = authSlice.actions;

export default authSlice.reducer;
