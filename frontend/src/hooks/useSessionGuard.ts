import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function useSessionGuard() {
  const navigate = useNavigate();
  const sessionRef = useRef<string | null>(null);

  useEffect(() => {

    sessionRef.current = localStorage.getItem("activeSession");

    const handleStorageChange = (event: StorageEvent) => {

      if (event.key === "activeSession") {

        const newSession = event.newValue;
        if (sessionRef.current && newSession !== sessionRef.current) {
          localStorage.removeItem("auth");
          navigate("/login", { replace: true });
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };

  }, [navigate]);
}