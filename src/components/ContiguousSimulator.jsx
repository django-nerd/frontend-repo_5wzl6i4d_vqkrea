import { useMemo, useState } from 'react';
import { Shuffle, SlidersHorizontal, ChevronRight, Info } from 'lucide-react';

function generateRandomArray(n, min = 5, max = 120) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

function allocateContiguous(partitions, processes, mode) {
  // Keep original sizes for fragmentation math and step explanations
  const parts = partitions.map((size, idx) => ({ id: idx, size, free: true }));
  const alloc = Array(processes.length).fill(null);
  const steps = [];

  const getCandidates = (size) =>
    parts
      .map((p, i) => ({ index: i, size: p.size, free: p.free, leftover: p.size - size }))
      .filter((p) => p.free && p.size >= size);

  processes.forEach((procSize, pi) => {
    const candidates = getCandidates(procSize);
    let chosenIndex = -1;
    let reason = '';

    if (candidates.length > 0) {
      if (mode === 'first') {
        chosenIndex = candidates[0].index;
        reason = 'First Fit memilih kandidat pertama yang cukup besar.';
      } else if (mode === 'best') {
        const best = [...candidates].sort((a, b) => a.leftover - b.leftover)[0];
        chosenIndex = best.index;
        reason = 'Best Fit memilih sisa (leftover) paling kecil untuk meminimalkan fragmentasi internal.';
      } else if (mode === 'worst') {
        const worst = [...candidates].sort((a, b) => b.leftover - a.leftover)[0];
        chosenIndex = worst.index;
        reason = 'Worst Fit memilih sisa (leftover) paling besar untuk menjaga blok besar tersisa.';
      }
    }

    if (chosenIndex !== -1) {
      const internalFrag = parts[chosenIndex].size - procSize;
      alloc[pi] = { partition: chosenIndex, internalFrag };
      parts[chosenIndex] = { ...parts[chosenIndex], free: false }; // mark taken but keep original size in steps
      steps.push({
        processIndex: pi,
        processSize: procSize,
        candidates,
        chosenIndex,
        internalFrag,
        result: 'TERPASANG',
        reason,
      });
    } else {
      steps.push({
        processIndex: pi,
        processSize: procSize,
        candidates,
        chosenIndex: -1,
        internalFrag: 0,
        result: 'GAGAL',
        reason: 'Tidak ada partisi yang cukup besar untuk proses ini.',
      });
    }
  });

  const used = alloc.filter(Boolean).length;
  const totalInternalFrag = alloc.reduce((acc, a) => acc + (a ? a.internalFrag : 0), 0);

  return { alloc, used, totalInternalFrag, parts, steps };
}

function Badge({ children, variant = 'emerald' }) {
  const styles = {
    emerald: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    sky: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
    red: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
    amber: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-[6px] border px-2 py-0.5 text-xs tracking-wide ${styles[variant]}`}>
      {children}
    </span>
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
      <div className="rounded-xl border-2 border-slate-800 bg-slate-900/60 p-4 shadow-[0_4px_0_0_rgba(15,23,42,1)]">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-[11px] text-slate-400 mb-1 uppercase tracking-wider">Jumlah Partisi</label>
            <input
              type="number"
              value={partCount}
              onChange={(e) => setPartCountAndResize(e.target.value)}
              className="w-full rounded-md bg-slate-800 border-2 border-slate-700 px-3 py-2 text-sm shadow-inner"
              min={1}
              max={12}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-md bg-slate-800 border-2 border-slate-700 px-3 py-2 text-sm hover:bg-slate-700 active:translate-y-[1px]"
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
                className="w-full rounded-md bg-slate-800 border-2 border-slate-700 px-2 py-1.5 text-sm"
                min={1}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border-2 border-slate-800 bg-slate-900/60 p-4 shadow-[0_4px_0_0_rgba(15,23,42,1)]">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-[11px] text-slate-400 mb-1 uppercase tracking-wider">Jumlah Proses</label>
            <input
              type="number"
              value={procCount}
              onChange={(e) => setProcCountAndResize(e.target.value)}
              className="w-full rounded-md bg-slate-800 border-2 border-slate-700 px-3 py-2 text-sm shadow-inner"
              min={1}
              max={16}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-md bg-slate-800 border-2 border-slate-700 px-3 py-2 text-sm hover:bg-slate-700 active:translate-y-[1px]"
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
                className="w-full rounded-md bg-slate-800 border-2 border-slate-700 px-2 py-1.5 text-sm"
                min={1}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border-2 border-slate-800 bg-slate-900/60 p-4 space-y-4 shadow-[0_6px_0_0_rgba(15,23,42,1)]">
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
                className={`rounded-md px-3 py-1.5 text-sm border-2 transition font-medium ${
                  mode === opt.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 shadow-[0_2px_0_0_rgba(16,185,129,0.3)]'
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

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-lg border-2 border-slate-800 bg-slate-900 p-3">
            <h3 className="text-sm font-semibold mb-2">Peta Partisi Memori</h3>
            <div className="flex flex-wrap gap-2">
              {partitions.map((size, i) => {
                const procIndex = result.alloc.findIndex((a) => a && a.partition === i);
                const assigned = procIndex !== -1;
                return (
                  <div
                    key={i}
                    className={`p-2 rounded-md border-2 text-xs font-medium ${
                      assigned
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                        : 'border-slate-700 bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="font-mono">Partisi {i + 1}: {size}</div>
                    {assigned && (
                      <div className="mt-1 text-[10px] opacity-80">→ Proses #{procIndex + 1} (frag: {result.alloc[procIndex].internalFrag})</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border-2 border-slate-800 bg-slate-900 p-3">
            <h3 className="text-sm font-semibold mb-2">Daftar Proses</h3>
            <div className="space-y-2">
              {processes.map((size, i) => {
                const a = result.alloc[i];
                return (
                  <div key={i} className="flex items-center justify-between rounded-md border-2 border-slate-700 bg-slate-800 px-3 py-2 text-sm">
                    <div className="font-mono">P{i + 1}</div>
                    <div className="font-mono">{size}</div>
                    <div>
                      {a ? (
                        <Badge variant="emerald">Masuk: Partisi {a.partition + 1}</Badge>
                      ) : (
                        <Badge variant="red">Tidak Muat</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div className="rounded-lg border-2 border-slate-800 bg-slate-900 p-3">
            <div className="text-sm text-slate-300">Total Proses Terpasang</div>
            <div className="text-2xl font-semibold text-emerald-300">{result.used} / {processes.length}</div>
          </div>
          <div className="rounded-lg border-2 border-slate-800 bg-slate-900 p-3">
            <div className="text-sm text-slate-300">Total Fragmentasi Internal</div>
            <div className="text-2xl font-semibold text-amber-300">{result.totalInternalFrag}</div>
          </div>
          <div className="rounded-lg border-2 border-slate-800 bg-slate-900 p-3">
            <div className="text-sm text-slate-300">Algoritma</div>
            <div className="text-2xl font-semibold text-sky-300 uppercase">{mode}</div>
          </div>
        </div>

        {/* Breakdown langkah-demi-langkah */}
        <div className="rounded-lg border-2 border-slate-800 bg-slate-900 p-3">
          <div className="text-sm font-semibold mb-2 flex items-center gap-2"><Info className="w-4 h-4"/>Breakdown Setiap Langkah</div>
          <ol className="space-y-2">
            {result.steps.map((s, idx) => (
              <li key={idx} className="rounded-md border-2 border-slate-700 bg-slate-800 p-3">
                <div className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-slate-400" />
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="font-mono font-semibold">P{s.processIndex + 1}</span> berukuran <span className="font-mono">{s.processSize}</span>
                      {s.chosenIndex !== -1 ? (
                        <>
                          {' '}ditempatkan ke <span className="font-mono">Partisi {s.chosenIndex + 1}</span> → fragmentasi internal <span className="font-mono">{s.internalFrag}</span>.
                        </>
                      ) : (
                        <> tidak dapat ditempatkan.</>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-slate-300">
                      <div className="mb-1">{s.reason}</div>
                      <div className="flex flex-wrap gap-1">
                        {s.candidates.length > 0 ? (
                          s.candidates.map((c) => (
                            <span key={c.index} className={`px-2 py-0.5 rounded border-2 text-[11px] ${
                              c.index === s.chosenIndex
                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                                : 'border-slate-700 bg-slate-800 text-slate-300'
                            }`}>
                              P{c.index + 1}: size {c.size}, leftover {c.leftover}
                            </span>
                          ))
                        ) : (
                          <span className="px-2 py-0.5 rounded border-2 border-slate-700 bg-slate-800 text-[11px] text-slate-300">Tidak ada kandidat</span>
                        )}
                      </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
