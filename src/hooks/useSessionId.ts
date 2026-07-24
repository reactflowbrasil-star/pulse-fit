import { useEffect, useState } from "react";

const KEY = "pulsefit_client_session";

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sess_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export function useSessionId() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let existing = window.localStorage.getItem(KEY);
    if (!existing) {
      existing = generateId();
      window.localStorage.setItem(KEY, existing);
    }
    setId(existing);
  }, []);
  return id;
}
