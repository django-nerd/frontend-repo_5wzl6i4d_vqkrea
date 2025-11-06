import { Cpu, Layers, BookOpen, Sparkles } from 'lucide-react';
import Spline from '@splinetool/react-spline';

export default function Header({ activeTab, onChangeTab }) {
  return (
    <header className="relative">
      {/* Top navigation bar */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur supports-[backdrop-filter]:bg-slate-900/40 sticky top-0 z-20">
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
      </div>

      {/* Pixel Modern Hero with Spline */}
      <div className="relative w-full h-[420px] md:h-[520px] bg-slate-950 overflow-hidden">
        <div className="absolute inset-0">
          <Spline scene="https://prod.spline.design/Jd4wcqFfe70N-TXP/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        </div>

        {/* Soft gradient top + bottom overlays, don't block Spline interactions */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950/80" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950/80 to-transparent" />

        {/* Content */}
        <div className="relative z-10 h-full">
          <div className="container mx-auto max-w-6xl h-full px-4 flex items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-[11px] uppercase tracking-wider text-fuchsia-200">
                <Sparkles className="w-3.5 h-3.5" />
                Pixel Art • Modern • Interactive
              </div>
              <h2 className="mt-4 text-3xl md:text-5xl font-extrabold leading-tight text-slate-100 drop-shadow-[0_2px_0_rgba(0,0,0,0.2)]">
                Belajar Alokasi Memori dengan Nuansa Pixel Modern
              </h2>
              <p className="mt-3 text-slate-300 md:text-lg">
                Eksplorasi algoritma First/Best/Worst Fit dan FIFO/LRU/Optimal melalui simulasi yang playful, 
                bergaya 8-bit/16-bit namun tetap modern dan nyaman digunakan.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() => onChangeTab('contiguous')}
                  className="rounded-md bg-emerald-500/90 hover:bg-emerald-400 text-emerald-950 font-semibold px-4 py-2 text-sm shadow-sm shadow-emerald-900/30"
                >
                  Mulai: Contiguous
                </button>
                <button
                  onClick={() => onChangeTab('paging')}
                  className="rounded-md bg-sky-500/90 hover:bg-sky-400 text-sky-950 font-semibold px-4 py-2 text-sm shadow-sm shadow-sky-900/30"
                >
                  Mulai: Paging PRU
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
