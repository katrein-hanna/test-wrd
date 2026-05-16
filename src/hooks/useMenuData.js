import { useEffect, useState } from "react";

export function useMenuData() {
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMenu() {
      try {
        const res = await fetch("/.netlify/functions/menu");

        if (!res.ok) {
          throw new Error("Failed to fetch menu");
        }

        const data = await res.json();

        if (!cancelled) {
          setMenuData(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMenu();

    return () => {
      cancelled = true;
    };
  }, []);

  return { menuData, loading, error };
}