
// Simple authentication for admin
// In a production app, this would use a more robust auth system

const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "admin123"; // Would use hashed passwords in production

// Get username and password from localStorage if available
export const getAdminUsername = (): string => {
  return localStorage.getItem("admin_username") || DEFAULT_ADMIN_USERNAME;
};

const getAdminPassword = (): string => {
  return localStorage.getItem("admin_password") || DEFAULT_ADMIN_PASSWORD;
};

export const login = (username: string, password: string): boolean => {
  const storedUsername = getAdminUsername();
  const storedPassword = getAdminPassword();
  
  const isValid = username === storedUsername && password === storedPassword;
  
  if (isValid) {
    setAuthenticated(true);
  }
  
  return isValid;
};

export const updateCredentials = (
  newUsername: string, 
  currentPassword: string, 
  newPassword: string
): boolean => {
  // Verify current password
  const storedPassword = getAdminPassword();
  
  if (currentPassword !== storedPassword) {
    return false;
  }
  
  // Update credentials
  localStorage.setItem("admin_username", newUsername);
  localStorage.setItem("admin_password", newPassword);
  
  return true;
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem("admin_authenticated") === "true";
};

// Adding the isAdmin function as an alias for isAuthenticated
export const isAdmin = (): boolean => {
  return isAuthenticated();
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
