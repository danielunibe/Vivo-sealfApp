import { AppSettings } from '../types';
import { getAppSettings } from './storage';

export const applyVisualTheme = (settings?: AppSettings) => {
  const prefs = (settings ?? getAppSettings()).visualPreferences;
  const root = document.documentElement;

  root.dataset.reducedMotion = prefs?.reducedMotion ? 'true' : 'false';
  root.dataset.premiumVisual = prefs?.premiumVisualMode === false ? 'false' : 'true';

  const darkMode = prefs?.darkMode === true;
  root.classList.toggle('dark', darkMode);
  root.style.colorScheme = darkMode ? 'dark' : 'light';
};
