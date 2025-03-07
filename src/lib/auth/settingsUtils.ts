// Settings management
export interface AppSettings {
  allowPublicPolls: boolean;
  // Add more settings here as needed
}

const DEFAULT_SETTINGS: AppSettings = {
  allowPublicPolls: true, // Default to allowing anyone to create polls
};

export const getSettings = (): AppSettings => {
  const settingsStr = localStorage.getItem("app_settings");
  if (!settingsStr) {
    return DEFAULT_SETTINGS;
  }
  
  try {
    return JSON.parse(settingsStr);
  } catch (error) {
    console.error("Error parsing settings:", error);
    return DEFAULT_SETTINGS;
  }
};

export const updateSettings = (settings: Partial<AppSettings>): void => {
  const currentSettings = getSettings();
  const newSettings = { ...currentSettings, ...settings };
  localStorage.setItem("app_settings", JSON.stringify(newSettings));
};

export const canCreatePoll = (): boolean => {
  const settings = getSettings();
  // Anyone can create a poll if allowPublicPolls is true
  // Otherwise, only admin can create a poll
  return settings.allowPublicPolls || isAuthenticated();
};

// Re-export isAuthenticated for this module
import { isAuthenticated } from './authUtils';
