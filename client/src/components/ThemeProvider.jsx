import { useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export default function ThemeProvider({ children }) {
  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      const root = document.documentElement;
      
      // Update theme colors
      if (settings.themeColors) {
        if (settings.themeColors.primary) root.style.setProperty('--color-primary', settings.themeColors.primary);
        if (settings.themeColors.secondary) root.style.setProperty('--color-secondary', settings.themeColors.secondary);
        if (settings.themeColors.accent) root.style.setProperty('--color-accent', settings.themeColors.accent);
      }
      
      // Update border radius
      if (settings.borderRadius) {
        if (settings.borderRadius.button) root.style.setProperty('--radius-button', settings.borderRadius.button);
        if (settings.borderRadius.popup) root.style.setProperty('--radius-popup', settings.borderRadius.popup);
      }
    }
  }, [settings]);

  return <>{children}</>;
}
