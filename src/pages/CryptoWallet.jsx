import { useEffect, useState } from "react";
import { useApi } from "../state/ApiContext.jsx";
import { Coins, ArrowUpRight, ArrowDownLeft, RefreshCcw } from "lucide-react";

export default function CryptoWallet() {
  const { baseUrl } = useApi();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = () => {
    setLoading(true);
    // Fetch from n8n or backend
    fetch(`${baseUrl}/partner/crypto/transactions`)
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        setTransactions(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Failed to fetch crypto transactions:", err);
        setTransactions([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions();
  }, [baseUrl]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-50">Registro Criptomoneda</h2>
          <p className="text-sm text-slate-400">
            Historial detallado de operaciones con tokens y criptoactivos.
          </p>
        </div>
        <button 
          onClick={fetchTransactions}
          className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 transition"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Coins className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Total Ingresos</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">
                +150.00 <span className="text-sm text-slate-500">TOKENS</span>
            </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
                <ArrowDownLeft className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Total Egresos</span>
            </div>
            <div className="text-2xl font-bold text-red-400">
                -50.00 <span className="text-sm text-slate-500">TOKENS</span>
            </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
                <RefreshCcw className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Operaciones</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">
                {transactions.length} <span className="text-sm text-slate-500">TXS</span>
            </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-xs uppercase text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Descripción</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">ID Transacción</th>
                <th className="px-4 py-3 font-medium text-right">Monto</th>
                <th className="px-4 py-3 font-medium text-right">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                    Cargando datos...
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/30 transition">
                    <td className="px-4 py-3 font-medium text-slate-200">
                        {tx.description || "Sin descripción"}
                    </td>
                    <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                            tx.type === 'deposit' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                            {tx.type === 'deposit' ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                            {tx.type === 'deposit' ? 'Depósito' : 'Retiro'}
                        </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {tx.transactionId}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}{tx.amount}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500 text-xs">
                        {new Date(tx.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                        <Coins className="h-8 w-8 mb-2 opacity-20" />
                        <p>No se encontraron transacciones</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
