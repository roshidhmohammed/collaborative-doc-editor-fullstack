// ---------------------------------------------------------------------------
// E2E test data — import these everywhere; never hardcode values in spec files
// ---------------------------------------------------------------------------

export const registerUserData1 = {
  fullName: "testrer1",
  email: "tester1@gmail.com",
  password: "Tester123@",
  confirmPassword: "Tester123@",
};

export const loginUserData1 = {
  email: "tester1@gmail.com",
  password: "Tester123@",
};

// ---------------------------------------------------------------------------

export const registerUserData2 = {
  fullName: "testrer2",
  email: "tester2@gmail.com",
  password: "Tester123@",
  confirmPassword: "Tester123@",
};

export const loginUserData2 = {
  email: "tester2@gmail.com",
  password: "Tester123@",
};

// ---------------------------------------------------------------------------

export const registerUserData3 = {
  fullName: "testrer3",
  email: "tester3@gmail.com",
  password: "Tester123@",
  confirmPassword: "Tester123@",
};

export const loginUserData3 = {
  email: "tester3@gmail.com",
  password: "Tester123@",
};

// ---------------------------------------------------------------------------

export const docDetails1 = {
  title: "AI",
};

// ---------------------------------------------------------------------------
// Aggregate for teardown
// ---------------------------------------------------------------------------
export const E2E_USER_EMAILS = [
  registerUserData1.email,
  registerUserData2.email,
  registerUserData3.email,
] as const;
