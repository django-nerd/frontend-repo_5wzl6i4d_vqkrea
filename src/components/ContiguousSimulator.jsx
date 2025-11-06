import { useMemo, useState } from 'react';
import { Shuffle, SlidersHorizontal } from 'lucide-react';

function generateRandomArray(n, min = 5, max = 120) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

function allocateContiguous(partitions, processes, mode) {
  // Returns allocation map and remaining partitions
  const alloc = Array(processes.length).fill(null);
  const parts = partitions.map((size, idx) => ({ id: idx, size, free: true }));

  const pickIndex = (size) => {
    const candidates = parts
      .map((p, i) => ({ ...p, i }))
      .filter((p) => p.free && p.size >= size);
    if (candidates.length === 0) return -1;

    if (mode === 'first') return candidates[0].i;
    if (mode === 'best') return candidates.sort((a, b) => a.size - b.size)[0].i;
    if (mode === 'worst') return candidates.sort((a, b) => b.size - a.size)[0].i;
    return -1;
  };

  processes.forEach((procSize, pi) => {
    const idx = pickIndex(procSize);
    if (idx !== -1) {
      alloc[pi] = { partition: idx, internalFrag: parts[idx].size - procSize };
      parts[idx] = { ...parts[idx], free: false, size: procSize };
    }
  });

  const used = alloc.filter(Boolean).length;
  const totalInternalFrag = alloc.reduce((acc, a) => acc + (a ? a.internalFrag : 0), 0);

  return { alloc, used, totalInternalFrag, parts };
}

function Badge({ children, color = 'emerald' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs border-${color}-500/40 bg-${color}-500/10 text-${color}-300`}>{children}</span>
  );
}

export default function ContiguousSimulator() {
  const [partCount, setPartCount] = useState(5);
  const [procCount, setProcCount] = useState(6);
  const [partitions, setPartitions] = useState([80, 30, 60, 120, 20]);
  const [processes, setProcesses] = useState([15, 20, 90, 10, 35, 50]);
  const [mode, setMode] = useState('first');

  const result = useMemo(() => allocateContiguous(partitions, processes, mode), [partitions, processes, mode]);

  const setPartCountAndResize = (n) => {
    const v = Math.max(1, Math.min(12, Number(n) || 0));
    setPartCount(v);
    setPartitions((prev) => {
      if (v > prev.length) return [...prev, ...generateRandomArray(v - prev.length, 10, 150)];
      return prev.slice(0, v);
    });
  };

  const setProcCountAndResize = (n) => {
    const v = Math.max(1, Math.min(16, Number(n) || 0));
    setProcCount(v);
    setProcesses((prev) => {
      if (v > prev.length) return [...prev, ...generateRandomArray(v - prev.length, 5, 130)];
      return prev.slice(0, v);
    });
  };

  return (
    <section className="space-y-8">
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs text-slate-400 mb-1">Jumlah Partisi</label>
            <input
              type="number"
              value={partCount}
              onChange={(e) => setPartCountAndResize(e.target.value)}
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
              min={1}
              max={12}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm hover:bg-slate-700"
              onClick={() => setPartitions(generateRandomArray(partCount, 10, 150))}
            >
              <Shuffle className="w-4 h-4" />
              Acak Partisi
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {Array.from({ length: partCount }).map((_, i) => (
            <div key={i} className="space-y-1">
              <label className="block text-[10px] text-slate-400">Partisi {i + 1}</label>
              <input
                type="number"
                value={partitions[i] ?? 0}
                onChange={(e) => {
                  const val = Math.max(1, Number(e.target.value) || 0);
                  setPartitions((prev) => prev.map((p, idx) => (idx === i ? val : p)));
                }}
                className="w-full rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm"
                min={1}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs text-slate-400 mb-1">Jumlah Proses</label>
            <input
              type="number"
              value={procCount}
              onChange={(e) => setProcCountAndResize(e.target.value)}
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
              min={1}
              max={16}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm hover:bg-slate-700"
              onClick={() => setProcesses(generateRandomArray(procCount, 5, 130))}
            >
              <Shuffle className="w-4 h-4" />
              Acak Proses
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {Array.from({ length: procCount }).map((_, i) => (
            <div key={i} className="space-y-1">
              <label className="block text-[10px] text-slate-400">Proses {i + 1}</label>
              <input
                type="number"
                value={processes[i] ?? 0}
                onChange={(e) => {
                  const val = Math.max(1, Number(e.target.value) || 0);
                  setProcesses((prev) => prev.map((p, idx) => (idx === i ? val : p)));
                }}
                className="w-full rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm"
                min={1}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-300">Algoritma:</span>
          <div className="flex items-center gap-2">
            {[
              { id: 'first', label: 'First Fit' },
              { id: 'best', label: 'Best Fit' },
              { id: 'worst', label: 'Worst Fit' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setMode(opt.id)}
                className={`rounded-md px-3 py-1.5 text-sm border transition ${
                  mode === opt.id
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="ml-auto inline-flex items-center gap-2 text-sm text-slate-300">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Hasil Simulasi</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
            <h3 className="text-sm font-semibold mb-2">Partisi Memori</h3>
            <div className="flex flex-wrap gap-2">
              {partitions.map((size, i) => {
                const procIndex = result.alloc.findIndex((a) => a && a.partition === i);
                const assigned = procIndex !== -1;
                return (
                  <div key={i} className={`p-2 rounded-md border text-xs ${assigned ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-slate-700 bg-slate-800 text-slate-300'}`}>
                    <div className="font-mono">P{i + 1}: {size}</div>
                    {assigned && (
                      <div className="mt-1 text-[10px] opacity-80">→ Proses #{procIndex + 1} (frag: {result.alloc[procIndex].internalFrag})</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
            <h3 className="text-sm font-semibold mb-2">Proses</h3>
            <div className="space-y-2">
              {processes.map((size, i) => {
                const a = result.alloc[i];
                return (
                  <div key={i} className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm">
                    <div className="font-mono">P{i + 1}</div>
                    <div className="font-mono">{size}</div>
                    <div>
                      {a ? (
                        <Badge color="emerald">Masuk: Partisi {a.partition + 1}</Badge>
                      ) : (
                        <Badge color="red">Tidak Muat</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
            <div className="text-sm text-slate-300">Total Proses Terpasang</div>
            <div className="text-2xl font-semibold text-emerald-300">{result.used} / {processes.length}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
            <div className="text-sm text-slate-300">Total Fragmentasi Internal</div>
            <div className="text-2xl font-semibold text-amber-300">{result.totalInternalFrag}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
            <div className="text-sm text-slate-300">Algoritma</div>
            <div className="text-2xl font-semibold text-sky-300 uppercase">{mode}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
