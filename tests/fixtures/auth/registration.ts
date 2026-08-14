export const validRegistrationCredentials = {
  fullName: "Integration Test User",
  email: "integration-register@example.com",
  password: "Password@123",
  confirmPassword: "Password@123",
};

export const passwordMismatchCredentials = {
  fullName: "Integration Test User",
  email: "password-mismatch@example.com",
  password: "Password@123",
  confirmPassword: "DifferentPassword@123",
};

export const invalidRegistrationCredentials = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};