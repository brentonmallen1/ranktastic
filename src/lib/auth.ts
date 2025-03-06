
// Simple authentication for admin
// In a production app, this would use a more robust auth system

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123"; // Would use hashed passwords in production

export const login = (username: string, password: string): boolean => {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem("admin_authenticated") === "true";
};

export const setAuthenticated = (value: boolean): void => {
  if (value) {
    localStorage.setItem("admin_authenticated", "true");
  } else {
    localStorage.removeItem("admin_authenticated");
  }
};

export const logout = (): void => {
  localStorage.removeItem("admin_authenticated");
};
