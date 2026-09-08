import { useEffect, useState } from "react";
import { getSettings, setSettings as persistSettings, ViewMode } from "../data/storage";

export function useSettings() {
  const [viewMode, setViewMode] = useState<ViewMode>("swipe");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const settings = await getSettings();
      setViewMode(settings.viewMode);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    persistSettings({ viewMode }).catch(() => {});
  }, [viewMode, loaded]);

  return { viewMode, setViewMode, loaded };
}
