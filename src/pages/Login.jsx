import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../state/ApiContext.jsx";

export default function Login() {
  const { setApiKey, setBaseUrl } = useApi();
  const [urlValue, setUrlValue] = useState(
    "https://dashboard-academicchain-labs.onrender.com"
  );
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); // null, 'checking', 'connected', 'error'
  const navigate = useNavigate();

  // Verificar conexión al cargar o cambiar URL
  const checkConnection = async (url) => {
    setConnectionStatus('checking');
    try {
      const res = await fetch(`${url.replace(/\/$/, "")}/api/health`);
      if (res.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch (e) {
      setConnectionStatus('error');
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    // 1. Configurar Base URL
    const finalUrl = urlValue.replace(/\/$/, ""); 
    setBaseUrl(finalUrl);

    try {
      // 2. Login directo para obtener cookie HttpOnly
      // IMPORTANT: credentials: 'include' es vital para recibir cookies cross-site
      const response = await fetch(`${finalUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include' 
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 3. Login exitoso
        setApiKey("admin-session-active"); // Flag para el frontend
        navigate("/");
      } else {
        alert(data.message || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error(error);
      alert("No se pudo conectar con el backend. Verifica la URL.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-8">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr,1fr]">
          <div className="glass-panel relative overflow-hidden p-8">
            <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="relative space-y-6">
              <div className="pill bg-slate-950/70 text-brand-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Infra de verificación instantánea
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
                Dashboard de emisiones académicas
              </h1>
              <p className="text-sm text-slate-300">
                Acceso restringido para administradores y partners autorizados.
                Gestión centralizada de llaves, instituciones y emisiones.
              </p>
            </div>
          </div>
          <div className="glass-panel p-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Acceso Administrativo
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Ingresa tus credenciales de administrador.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 flex justify-between">
                  Backend URL
                  {connectionStatus === 'checking' && <span className="text-yellow-500">Conectando...</span>}
                  {connectionStatus === 'connected' && <span className="text-emerald-500">En línea ●</span>}
                  {connectionStatus === 'error' && <span className="text-rose-500">Sin conexión ●</span>}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={urlValue}
                    onChange={(e) => setUrlValue(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                    placeholder="http://localhost:3001"
                  />
                  <button 
                    type="button" 
                    onClick={() => checkConnection(urlValue)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                  >
                    Test
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">
                  Contraseña Admin
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center"
              >
                {loading ? "Conectando..." : "Iniciar Sesión"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
