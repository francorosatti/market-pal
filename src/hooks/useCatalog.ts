import { useEffect, useState } from "react";
import { getCatalog, setCatalog as persistCatalog } from "../data/storage";
import { Category } from "../data/types";

export function useCatalog() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const catalog = await getCatalog();
      setCategories(catalog.categories);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    persistCatalog({ categories }).catch(() => {});
  }, [categories, loaded]);

  return { categories, setCategories, loaded };
}
