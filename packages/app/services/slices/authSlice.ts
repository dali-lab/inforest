import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@ong-forestry/schema";
import { userApi } from "../endpoints";
import { RootState } from "../store";

export type AuthState = {
  /**
   * Currently logged in user
   */
  user: User | null;
  /**
   * User's current JWT token
   */
  token: string | null;
};

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: null } as AuthState,
  reducers: {
    setCredentials: (
      state,
      { payload: { user, token } }: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = user;
      state.token = token;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      // whenever the login action is 'fulfilled' or finished successfully, grab its payload and use it to set the auth state's credentials
      userApi.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        state.token = payload.token;
        state.user = payload.user;
      }
    );
  },
});

export const { setCredentials } = authSlice.actions;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export default authSlice.reducer;
