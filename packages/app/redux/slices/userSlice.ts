import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";

const BASE_URL = SERVER_URL + "users/";

export interface AuthParams {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
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
        return { ...response.data };
      })
      .catch((error) => {
        alert(
          "Unable to log in, please ensure your email and password are correct."
        );
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
      .then((response) => {
        alert("Sign up successful! Use your account information to sign in.");
        return response.data;
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
      .patch<LoginResponse>(`${BASE_URL}verify`, credentials)
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

export const getUserByToken = createAsyncThunk(
  "user/getUserByToken",
  async (token: string) => {
    return await axios
      .get<User>(`${BASE_URL}${token}`)
      .then((response) => response.data)
      .catch((err) => {
        console.error(err);
        alert("Your login session has expired.");
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
      return state;
    },
    logout: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      if (action.payload) {
        // @ts-ignore
        state.token = action.payload.token;
        // @ts-ignore
        state.currentUser = action.payload.user;
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${state.token}`;
        return state;
      }
    });
    // builder.addCase(signUp.fulfilled, (state, action) => {
    //   // console.log(action.payload);
    //   // // @ts-ignore
    //   // state.token = action.payload.token;
    //   // // @ts-ignore
    //   // state.currentUser = action.payload.user;
    //   // return state;
    // });
    builder.addCase(editUser.fulfilled, (state, action) => {
      if (action.payload) {
        state.currentUser = action.payload[0];
      }
      return state;
    });
    builder.addCase(getUserByToken.fulfilled, (state, action) => {
      console.log(action);
      if (action.payload && action.meta.arg === state.token) {
        state.currentUser = action.payload;
      }
      return state;
    });
    builder.addCase(getUserByToken.rejected, (state, action) => {
      return initialState;
    });
    builder.addCase(verify.fulfilled, (state, action) => {
      if (action.payload) {
        state.token = action.payload.token;
        state.currentUser = action.payload.user;
      }
      return state;
    });
    builder.addCase(resendCode.fulfilled, () => {});
  },
});

export const { setCredentials, logout } = userSlice.actions;

export default userSlice.reducer;
