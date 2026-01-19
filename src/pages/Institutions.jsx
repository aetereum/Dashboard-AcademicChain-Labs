import { useEffect, useMemo, useState } from "react";
import { useApi } from "../state/ApiContext.jsx";
import { buildDashboardService } from "../services/dashboardService.js";
import { 
  Building2, 
  MoreHorizontal, 
  ShieldCheck, 
  Key, 
  Activity, 
  X,
  Copy,
  CheckCircle2
} from "lucide-react";

export default function Institutions() {
  const { apiKey, baseUrl, activeInstitution, setActiveInstitution } = useApi();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selection & Modals
  const [selectedInst, setSelectedInst] = useState(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  
  // API Key Creation State
  const [isKeyModalOpen, setKeyModalOpen] = useState(false);
  const [keyDraft, setKeyDraft] = useState({
    label: "",
    role: "institution_admin",
  });
  const [createdKey, setCreatedKey] = useState(null); // { secret, ... }

  // Draft for new Institution
  const [instDraft, setInstDraft] = useState({
    name: "",
    slug: "",
    tokenId: "",
    plan: "Startup",
  });

  const [limits, setLimits] = useState(() => {
    const stored = localStorage.getItem("ac_emission_limits");
    return stored ? JSON.parse(stored) : {};
  });

  const [search, setSearch] = useState("");

  const filteredRows = useMemo(() => {
    if (!search) return rows;
    return rows.filter(r => 
      r.name.toLowerCase().includes(search.toLowerCase()) || 
      r.slug?.toLowerCase().includes(search.toLowerCase())
    );
  }, [rows, search]);

  const service = useMemo(
    () => buildDashboardService({ baseUrl, apiKey }),
    [baseUrl, apiKey]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await service.getInstitutions();
        if (!cancelled) {
          setRows(data);
        }
      } catch (err) {
        console.error("Failed to load institutions", err);
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [service]);

  // Handle limits
  function updateLimit(id, delta) {
    setLimits((current) => {
      const next = { ...current, [id]: Math.max(0, (current[id] || 0) + delta) };
      localStorage.setItem("ac_emission_limits", JSON.stringify(next));
      return next;
    });
  }

  // Handle credits
  const [creditsAmount, setCreditsAmount] = useState(100);
  const activeSelectedInst = useMemo(() => rows.find(r => r.id === selectedInst?.id), [rows, selectedInst]);

  async function handleUpdateCredits(id, amount) {
      if (!service.updateInstitutionCredits) return;
      try {
          const res = await service.updateInstitutionCredits(id, amount);
          if (res.success) {
               setRows(rows.map(r => r.id === id ? { ...r, credits: res.credits } : r));
               // Update selectedInst if it's the one being modified
               if (selectedInst?.id === id) {
                   setSelectedInst(prev => ({ ...prev, credits: res.credits }));
               }
          }
      } catch (err) {
          console.error("Error updating credits", err);
          alert("Error al actualizar créditos");
      }
  }

  async function handlePanic(id) {
    if (!confirm("⚠️ ¿ESTÁS SEGURO? \n\nEsto revocará inmediatamente la capacidad de emitir credenciales para esta institución (Créditos = 0).")) return;
    
    const inst = rows.find(r => r.id === id);
    if (!inst) return;
    
    // Set credits to 0 by subtracting current credits
    const currentCredits = inst.credits || 0;
    if (currentCredits > 0) {
        await handleUpdateCredits(id, -currentCredits);
    }
    alert("Protocolo de pánico activado. La institución ha sido detenida.");
  }

  // Institution Creation
  function handleOpenCreateModal() {
    setInstDraft({ name: "", slug: "", tokenId: "", plan: "Startup" });
    setCreateModalOpen(true);
  }

  async function handleCreateInstitution(e) {
    e.preventDefault();
    try {
      if (!service.createInstitution) {
        throw new Error("Servicio no disponible");
      }
      
      const newInst = await service.createInstitution({
        name: instDraft.name,
        slug: instDraft.slug,
        plan: instDraft.plan
      });

      setRows([newInst, ...rows]);
      setCreateModalOpen(false);
      // Reset draft
      setInstDraft({ name: "", slug: "", tokenId: "", plan: "Startup" });
      alert("Institución creada exitosamente. Ahora puedes generarle llaves.");
    } catch (err) {
      console.error(err);
      alert("Error al crear institución: " + err.message);
    }
  }

  // API Key Creation Flow
  function openKeyModal() {
    if (!selectedInst) return;
    setKeyDraft({
      label: `Key para ${selectedInst.name}`,
      role: "institution_admin",
    });
    setCreatedKey(null);
    setKeyModalOpen(true);
  }

  async function handleGenerateKey(e) {
    e.preventDefault();
    try {
      let newKeyData = null;
      if (service.createApiKeyForInstitution) {
         const response = await service.createApiKeyForInstitution(selectedInst.id, {
           label: keyDraft.label,
           role: keyDraft.role
         });
         newKeyData = response;
      }
      
      // Fallback if backend doesn't return the key (should not happen in prod)
      const secret = newKeyData?.apiKey || newKeyData?.key || "acp_" + Array.from(crypto.getRandomValues(new Uint8Array(20))).map(b => b.toString(16).padStart(2, '0')).join('');
      
      setCreatedKey({ ...keyDraft, secret });
      // Don't close modal, switch to "Success" view
    } catch (error) {
      console.error(error);
      alert("Error al crear la API Key: " + (error.response?.data?.message || error.message));
    }
  }

  // Detail View Helper
  function handleRowClick(inst) {
    setSelectedInst(inst);
    setActiveInstitution(inst); // Keep context in sync
  }

  return (
    <div className="flex h-full gap-6">
      {/* Main List Section */}
      <div className={`flex-1 flex flex-col gap-4 transition-all ${selectedInst ? 'w-2/3' : 'w-full'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Instituciones</h2>
            <p className="text-xs text-slate-400">Gestión de universidades y partners conectados.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
               <input
                 type="text"
                 placeholder="Buscar institución..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="h-9 w-64 rounded-xl border border-slate-800 bg-slate-950/50 pl-3 pr-4 text-xs text-slate-200 placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none"
               />
             </div>
            <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-3 py-2 text-xs font-medium text-slate-950 hover:bg-brand-400"
          >
            <Building2 className="h-3.5 w-3.5" />
            Nueva Institución
          </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/70">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-950/90 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Institución</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">Llaves</th>
                <th className="px-4 py-3 text-right">Emisiones</th>
                <th className="px-4 py-3 text-right">Créditos</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredRows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row)}
                  className={`cursor-pointer transition hover:bg-slate-900/60 ${selectedInst?.id === row.id ? 'bg-slate-900/80 border-l-2 border-brand-500' : 'bg-slate-950/40'}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 font-bold text-xs">
                        {row.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-200">{row.name}</div>
                        <div className="text-[10px] text-slate-500">{row.plan} • {row.tokenId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${row.status === 'Activa' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-slate-300">
                    <div className="flex items-center justify-end gap-1">
                      <Key className="h-3 w-3 text-slate-500" />
                      <span>{row.activeKeys || 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-slate-300">
                    {row.emissions?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-slate-300">
                    {(limits[row.id] || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <MoreHorizontal className="ml-auto h-4 w-4 text-slate-500" />
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-slate-500">
                    No se encontraron instituciones.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Slide-over Panel */}
      {selectedInst && (
        <div className="w-96 flex-none flex flex-col gap-4 border-l border-slate-800 bg-slate-950/50 p-6 backdrop-blur-sm animate-in slide-in-from-right-10 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 text-brand-200 font-bold text-lg border border-brand-500/20">
                {selectedInst.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-slate-100">{selectedInst.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedInst.tokenId}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedInst(null)}
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <Activity className="h-3 w-3" /> Emisiones
                </div>
                <div className="text-lg font-semibold text-slate-100">{selectedInst.emissions?.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <ShieldCheck className="h-3 w-3" /> Verificaciones
                </div>
                <div className="text-lg font-semibold text-slate-100">{selectedInst.verifications?.toLocaleString()}</div>
              </div>
            </div>

            {/* Emission Control */}
            <div className="space-y-3 rounded-xl border border-slate-800 p-4">
              <h4 className="text-xs font-medium text-slate-300">Gestión de Créditos (Saldo)</h4>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Créditos Disponibles</span>
                <span className="text-lg font-mono font-bold text-emerald-400">
                  {(activeSelectedInst?.credits || 0).toLocaleString()}
                </span>
              </div>
              
              <div className="flex gap-2 pt-2">
                <input 
                  type="number" 
                  value={creditsAmount}
                  onChange={(e) => setCreditsAmount(Number(e.target.value))}
                  className="w-20 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-center text-xs text-slate-200 focus:border-brand-500/50 focus:outline-none"
                />
                <button 
                  onClick={() => handleUpdateCredits(selectedInst.id, -creditsAmount)}
                  className="flex-1 rounded-lg border border-red-900/30 bg-red-950/20 py-1.5 text-xs text-red-400 hover:bg-red-900/40"
                >
                  -{creditsAmount}
                </button>
                <button 
                  onClick={() => handleUpdateCredits(selectedInst.id, creditsAmount)}
                  className="flex-1 rounded-lg border border-emerald-900/30 bg-emerald-950/20 py-1.5 text-xs text-emerald-400 hover:bg-emerald-900/40"
                >
                  +{creditsAmount}
                </button>
              </div>
            </div>

            {/* Panic Button */}
            <div className="rounded-xl border border-red-900/20 bg-red-950/10 p-4">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-red-400">Zona de Peligro</span>
                  <Activity className="h-4 w-4 text-red-500" />
               </div>
               <button 
                 onClick={() => handlePanic(selectedInst.id)}
                 className="mt-3 w-full rounded-lg bg-red-600 py-2 text-xs font-bold text-white hover:bg-red-500 transition shadow-lg shadow-red-900/20"
               >
                 BOTÓN DE PÁNICO (Revocar Todo)
               </button>
               <p className="mt-2 text-[10px] text-red-300/60 leading-tight">
                 Esto establecerá los créditos a 0 inmediatamente, deteniendo cualquier emisión en curso de esta institución.
               </p>
            </div>

            {/* API Keys Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-medium text-slate-300">API Keys</h4>
                <button 
                  onClick={openKeyModal}
                  className="text-[10px] text-brand-400 hover:text-brand-300"
                >
                  + Generar Nueva
                </button>
              </div>
              
              <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-3 text-center">
                <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-500">
                  <Key className="h-4 w-4" />
                </div>
                <p className="text-xs text-slate-500">
                  Gestiona las llaves de acceso para esta institución.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Institution Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-100">Nueva Institución</h3>
            <form onSubmit={handleCreateInstitution} className="mt-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Nombre Oficial</label>
                <input
                  required
                  value={instDraft.name}
                  onChange={(e) => setInstDraft({ ...instDraft, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-brand-500"
                  placeholder="Ej: Universidad Tecnológica"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Token ID</label>
                  <input
                    value={instDraft.tokenId}
                    onChange={(e) => setInstDraft({ ...instDraft, tokenId: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-mono text-slate-200 outline-none focus:border-brand-500"
                    placeholder="0.0.xxxxx"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Plan</label>
                  <select
                    value={instDraft.plan}
                    onChange={(e) => setInstDraft({ ...instDraft, plan: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-brand-500"
                  >
                    <option value="Startup">Startup</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCreateModalOpen(false)} className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200">Cancelar</button>
                <button type="submit" className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-brand-400">Crear Institución</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Key Modal (Creation & Success) */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            {!createdKey ? (
              <>
                <h3 className="text-lg font-semibold text-slate-100">Generar API Key</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Creando llave para <span className="text-slate-200">{selectedInst?.name}</span>
                </p>
                <form onSubmit={handleGenerateKey} className="mt-4 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Nombre de la llave</label>
                    <input
                      required
                      value={keyDraft.label}
                      onChange={(e) => setKeyDraft({ ...keyDraft, label: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-brand-500"
                      placeholder="Ej: Integración Portal Estudiantes"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Permisos (Scope)</label>
                    <select
                      value={keyDraft.role}
                      onChange={(e) => setKeyDraft({ ...keyDraft, role: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-brand-500"
                    >
                      <option value="institution_admin">Administrador (Total)</option>
                      <option value="issuer">Solo Emisión</option>
                      <option value="verifier">Solo Verificación</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={() => setKeyModalOpen(false)} className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200">Cancelar</button>
                    <button type="submit" className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-brand-400">Generar y Cifrar</button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-100">¡API Key Generada!</h3>
                <p className="mt-2 text-xs text-slate-400">
                  Esta es la única vez que verás esta llave. Cópiala y guárdala en un lugar seguro.
                </p>
                
                <div className="mt-6 group relative overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-4">
                  <code className="break-all font-mono text-sm text-brand-200">
                    {createdKey.secret}
                  </code>
                  <button 
                    onClick={() => navigator.clipboard.writeText(createdKey.secret)}
                    className="absolute right-2 top-2 rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:text-white"
                    title="Copiar"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-6">
                  <button 
                    onClick={() => setKeyModalOpen(false)}
                    className="w-full rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700"
                  >
                    Entendido, la he guardado
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}