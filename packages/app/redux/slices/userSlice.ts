import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";

const BASE_URL = SERVER_URL + "users/";

interface AuthParams {
  email: string;
  password: string;
  name?: string;
}

type LoginResponse = { token: string; user: User };

export const login = createAsyncThunk(
  "user/login",
  async (credentials: AuthParams) => {
    // const { dispatch } = thunkApi;
    return await axios
      .post<LoginResponse>(`${BASE_URL}login`, credentials)
      .then((response) => {
        if (response.status == 403) {
          // forbidden - not verified
          return {
            user: { email: credentials.email },
            verified: false,
          };
        }
        return { ...response.data, verified: true };
      })
      .catch((error) => {
        console.error("Error when logging in", error);
      });
  }
);

// might not need to be a thunk but it might end up calling login() or something
export const signUp = createAsyncThunk(
  "user/signUp",
  async (credentials: AuthParams) => {
    return await axios
      .post(`${BASE_URL}signup`, credentials)
      .then(() => {
        return true;
      })
      .catch((error) => {
        console.error("Error when signing up", error);
        return false;
      });
  }
);

export const verify = createAsyncThunk(
  "user/verify",
  async (credentials: { email: string; code: string }) => {
    return await axios
      .post<LoginResponse>(`${BASE_URL}verify`, credentials)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error("Error when verifying", error);
      });
  }
);

export const resendCode = createAsyncThunk(
  "user/resend-code",
  async (credentials: { email: string }) => {
    // const { dispatch } = thunkApi;
    return await axios
      .post<LoginResponse>(`${BASE_URL}resend-code`, credentials)
      .then(() => {
        return true;
      })
      .catch((error) => {
        console.error("Error when sending code", error);
      });
  }
);

type EditUserParams = Partial<User> & { id: string };

// TODO: enforce that the current user is the one being edited
export const editUser = createAsyncThunk(
  "user/editUser",
  async (user: EditUserParams) => {
    return await axios
      .patch<User[]>(`${BASE_URL}`, null, {
        params: user,
      })
      .then((response) => {
        if (response.data.length != 1) {
          return response.data;
        }
        console.error("Invalid Response");
      })
      .catch((error) => {
        console.error("Request Failed", error);
      });
  }
);

export interface UserState {
  token: string | null;
  currentUser: User | null;
}

const initialState: UserState = {
  token: null,
  currentUser: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<LoginResponse>) => {
      state.token = action.payload.token;
      state.currentUser = action.payload.user;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      if (action.payload) {
        // @ts-ignore
        state.token = action.payload.token;
        // @ts-ignore
        state.currentUser = action.payload.user;
      }
    });
    builder.addCase(signUp.fulfilled, () => {});
    builder.addCase(editUser.fulfilled, (state, action) => {
      if (action.payload) {
        state.currentUser = action.payload[0];
      }
    });
    builder.addCase(verify.fulfilled, (state, action) => {
      if (action.payload) {
        state.token = action.payload.token;
        state.currentUser = action.payload.user;
      }
    });
    builder.addCase(resendCode.fulfilled, () => {});
  },
});

export const { setCredentials } = userSlice.actions;

export default userSlice.reducer;
