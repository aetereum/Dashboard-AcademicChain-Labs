import { Outlet, NavLink } from "react-router-dom";
import { BarChart3, KeyRound, School, ActivitySquare, ShieldCheck, FileText, PieChart } from "lucide-react";
import { useApi } from "../../state/ApiContext.jsx";
import ToastHost from "../feedback/ToastHost.jsx";

const navItems = [
  { to: "/", label: "Dashboard", icon: BarChart3, exact: true },
  { to: "/metricas", label: "Métricas", icon: PieChart },
  { to: "/instituciones", label: "Instituciones", icon: School },
  { to: "/api-keys", label: "Gestión API Keys", icon: KeyRound },
  { to: "/logs", label: "Logs de Auditoría", icon: FileText },
  { to: "/emisiones", label: "Emisiones", icon: ActivitySquare },
  { to: "/verificacion", label: "Verificación", icon: ShieldCheck },
];

export default function Layout() {
  const { apiKey, baseUrl } = useApi();
  const maskedKey = apiKey ? apiKey.slice(0, 4) + "…" + apiKey.slice(-4) : "Sin API key";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <ToastHost />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-8">
        <aside className="glass-panel hidden w-64 flex-shrink-0 flex-col justify-between p-4 lg:flex">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-300 text-xl font-semibold text-slate-950">
                AC
              </div>
              <div>
                <div className="text-sm font-semibold tracking-wide text-slate-100">
                  AcademicChain Admin Center
                </div>
                <div className="text-xs text-slate-400">Credenciales verificables</div>
              </div>
            </div>
            <nav className="space-y-1 text-sm">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-xl px-3 py-2 transition-colors",
                      isActive
                        ? "bg-brand-500/20 text-brand-100 font-medium"
                        : "text-slate-200 hover:bg-slate-800/80 hover:text-white",
                    ].join(" ")
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="space-y-2 text-xs">
            <div className="pill w-full justify-between bg-slate-950/60">
              <span className="truncate text-slate-300">API key</span>
              <span className="font-mono text-[11px] text-slate-200">{maskedKey}</span>
            </div>
            <div className="pill w-full justify-between bg-slate-950/60">
              <span className="text-slate-300">API base</span>
              <span className="truncate text-[11px] text-slate-200">{baseUrl}</span>
            </div>
          </div>
        </aside>
        <main className="flex-1 space-y-4">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-50">
                AcademicChain Admin Center
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Controla universidades, API keys y credenciales emitidas en tiempo real.
              </p>
            </div>
            <div className="pill bg-brand-500/10 text-brand-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Infraestructura lista para producción
            </div>
          </header>
          <div className="glass-panel min-h-[520px] p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
