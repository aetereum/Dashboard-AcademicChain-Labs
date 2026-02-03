import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { buildDashboardService } from "../services/dashboardService.js";

const ApiContext = createContext(null);

export function ApiProvider({ children }) {
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("ac_api_key") || null
  );
  const [baseUrl, setBaseUrl] = useState(
    () =>
      localStorage.getItem("ac_base_url") ||
      import.meta.env.VITE_API_BASE_URL ||
      "https://n8n-b0be.onrender.com/webhook/academic-api"
  );
  const [activeInstitution, setActiveInstitution] = useState(null);
  const [isSessionChecking, setIsSessionChecking] = useState(true);

  const service = useMemo(
    () => (baseUrl ? buildDashboardService({ baseUrl, apiKey: apiKey || 'temp' }) : null),
    [baseUrl, apiKey]
  );

  // Check session on mount
  useEffect(() => {
    async function checkSession() {
      if (!service) return;
      setIsSessionChecking(true);
      try {
        // En n8n no tenemos un endpoint /api/auth/check por defecto.
        // Asumiremos sesión válida si hay apiKey almacenada, 
        // o podemos hacer una llamada simple a /logs o similar si queremos verificar.
        // Por ahora, para evitar bloqueos por CORS o rutas inexistentes en n8n:
        // Si hay baseUrl y apiKey, lo damos por válido.
        // TODO: Implementar un endpoint real de "ping" en n8n.
        
        // Simulación de check exitoso para no bloquear al usuario
        // setApiKey("admin-session-active"); 
        
        // Opcional: Intentar un fetch real si es necesario, pero con timeout corto
        // const res = await fetch(`${baseUrl}?route=/auth/check`, { ... });
      } catch (e) {
        // Ignorar errores de red en checkeo inicial para no desloguear agresivamente
        console.warn("Session check warning:", e);
      } finally {
        setIsSessionChecking(false);
      }
    }

    checkSession();
  }, [baseUrl]);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("ac_api_key", apiKey);
    } else {
      localStorage.removeItem("ac_api_key");
    }
  }, [apiKey]);

  useEffect(() => {
    if (baseUrl) {
      localStorage.setItem("ac_base_url", baseUrl);
    }
  }, [baseUrl]);

  const value = {
    apiKey,
    setApiKey,
    baseUrl,
    setBaseUrl,
    service,
    activeInstitution,
    setActiveInstitution,
    isSessionChecking
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) {
    throw new Error("useApi must be used within ApiProvider");
  }
  return ctx;
}
