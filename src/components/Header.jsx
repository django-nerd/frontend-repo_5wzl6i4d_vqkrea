import { Cpu, Layers, BookOpen } from 'lucide-react';

export default function Header({ activeTab, onChangeTab }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur supports-[backdrop-filter]:bg-slate-900/40 sticky top-0 z-10">
      <div className="container mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cpu className="w-6 h-6 text-emerald-400" />
          <div>
            <h1 className="text-lg font-semibold leading-tight">Memory Allocation Learning Lab</h1>
            <p className="text-xs text-slate-400 -mt-0.5">Contiguous & Non-Contiguous (Paging) Interactive Simulations</p>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <button
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
              activeTab === 'contiguous'
                ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/30'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            onClick={() => onChangeTab('contiguous')}
          >
            <Layers className="w-4 h-4" />
            Contiguous
          </button>
          <button
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
              activeTab === 'paging'
                ? 'bg-blue-500/10 text-blue-300 ring-1 ring-blue-400/30'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            onClick={() => onChangeTab('paging')}
          >
            <BookOpen className="w-4 h-4" />
            Paging PRU
          </button>
        </nav>
      </div>
    </header>
  );
}
