
import { useCallback, useEffect, useState } from "react";

function useFetch(fetchFunction) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      console.error("Data loading error:", err);

      setError(
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        "Məlumatları yükləmək mümkün olmadı."
      );
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}

export default useFetch;
