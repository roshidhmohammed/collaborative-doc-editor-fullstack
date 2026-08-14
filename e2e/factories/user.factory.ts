// ---------------------------------------------------------------------------
// User factory
//
// Re-exports the static user data with a thin convenience layer.
// Tests should import directly from test-data.ts for constants;
// use these factories when you need programmatic/dynamic test user data.
// ---------------------------------------------------------------------------
import {
  registerUserData1,
  registerUserData2,
  registerUserData3,
  loginUserData1,
  loginUserData2,
  loginUserData3,
} from "../data/test-data";

export type UserRegistrationData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type UserLoginData = {
  email: string;
  password: string;
};

export const users = {
  user1: {
    register: registerUserData1,
    login: loginUserData1,
  },
  user2: {
    register: registerUserData2,
    login: loginUserData2,
  },
  user3: {
    register: registerUserData3,
    login: loginUserData3,
  },
} as const;
