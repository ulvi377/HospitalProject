
import { useCallback, useState } from "react";

function useToast() {
  const [toast, setToast] = useState(null);

  const success = useCallback((text) => {
    setToast({ type: "success", text });
  }, []);

  const error = useCallback((text) => {
    setToast({ type: "error", text });
  }, []);

  return {
    toast,
    success,
    error,
    clear: () => setToast(null),
  };
}

export default useToast;
