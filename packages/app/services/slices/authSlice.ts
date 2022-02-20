import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@ong-forestry/schema";

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
});

export const { setCredentials } = authSlice.actions;

export default authSlice.reducer;
