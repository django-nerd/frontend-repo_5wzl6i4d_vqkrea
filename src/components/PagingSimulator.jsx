import { useMemo, useState } from 'react';
import { Shuffle, Info, ChevronRight } from 'lucide-react';

function parseRefString(text) {
  return text
    .split(/[,\s]+/)
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v));
}

function simulateFIFO(refs, frames) {
  const frame = Array(frames).fill(null);
  const queue = [];
  let hits = 0;
  const steps = [];
  refs.forEach((p) => {
    const idx = frame.indexOf(p);
    let replaced = null;
    if (idx !== -1) {
      hits++;
    } else {
      if (queue.length < frames) {
        const slot = frame.indexOf(null);
        frame[slot] = p;
        queue.push(slot);
      } else {
        const victimSlot = queue.shift();
        replaced = frame[victimSlot];
        frame[victimSlot] = p;
        queue.push(victimSlot);
      }
    }
    steps.push({ page: p, frame: [...frame], hit: idx !== -1, replaced });
  });
  return { steps, hits, faults: refs.length - hits };
}

function simulateLRU(refs, frames) {
  const frame = Array(frames).fill(null);
  const lastUsed = new Map();
  let time = 0;
  let hits = 0;
  const steps = [];
  refs.forEach((p) => {
    const idx = frame.indexOf(p);
    let replaced = null;
    if (idx !== -1) {
      hits++;
      lastUsed.set(p, time);
    } else {
      if (frame.includes(null)) {
        const slot = frame.indexOf(null);
        frame[slot] = p;
        lastUsed.set(p, time);
      } else {
        // victim is least recently used
        let victimIndex = 0;
        let oldestTime = Infinity;
        frame.forEach((val, i) => {
          const t = lastUsed.get(val) ?? -1;
          if (t < oldestTime) {
            oldestTime = t;
            victimIndex = i;
          }
        });
        replaced = frame[victimIndex];
        frame[victimIndex] = p;
        lastUsed.delete(replaced);
        lastUsed.set(p, time);
      }
    }
    steps.push({ page: p, frame: [...frame], hit: idx !== -1, replaced });
    time++;
  });
  return { steps, hits, faults: refs.length - hits };
}

function simulateOptimal(refs, frames) {
  const frame = Array(frames).fill(null);
  let hits = 0;
  const steps = [];
  refs.forEach((p, i) => {
    const idx = frame.indexOf(p);
    let replaced = null;
    if (idx !== -1) {
      hits++;
    } else {
      if (frame.includes(null)) {
        const slot = frame.indexOf(null);
        frame[slot] = p;
      } else {
        // choose victim with farthest next use
        let victimIndex = 0;
        let farthest = -1;
        frame.forEach((val, fi) => {
          const nextUse = refs.slice(i + 1).indexOf(val);
          const distance = nextUse === -1 ? Infinity : nextUse;
          if (distance > farthest) {
            farthest = distance;
            victimIndex = fi;
          }
        });
        replaced = frame[victimIndex];
        frame[victimIndex] = p;
      }
    }
    steps.push({ page: p, frame: [...frame], hit: idx !== -1, replaced });
  });
  return { steps, hits, faults: refs.length - hits };
}

const presets = {
  small: { refs: '7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2', frames: 3 },
  medium: { refs: '1 2 3 4 1 2 5 1 2 3 4 5', frames: 4 },
};

export default function PagingSimulator() {
  const [refString, setRefString] = useState(presets.small.refs);
  const [frames, setFrames] = useState(presets.small.frames);
  const [algo, setAlgo] = useState('fifo');

  const refs = useMemo(() => parseRefString(refString), [refString]);

  const result = useMemo(() => {
    if (algo === 'fifo') return simulateFIFO(refs, frames);
    if (algo === 'lru') return simulateLRU(refs, frames);
    return simulateOptimal(refs, frames);
  }, [refs, frames, algo]);

  return (
    <section className="space-y-8">
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[240px]">
            <label className="block text-xs text-slate-400 mb-1">Reference String</label>
            <input
              type="text"
              value={refString}
              onChange={(e) => setRefString(e.target.value)}
              placeholder="contoh: 7, 0, 1, 2, 0, 3, ..."
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Jumlah Frame</label>
            <input
              type="number"
              value={frames}
              min={1}
              max={10}
              onChange={(e) => setFrames(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
              className="w-28 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm hover:bg-slate-700"
              onClick={() => {
                const arr = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));
                setRefString(arr.join(', '));
              }}
            >
              <Shuffle className="w-4 h-4" />
              Acak
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[
            { id: 'fifo', label: 'FIFO' },
            { id: 'lru', label: 'LRU' },
            { id: 'optimal', label: 'Optimal' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setAlgo(opt.id)}
              className={`rounded-md px-3 py-1.5 text-sm border transition ${
                algo === opt.id
                  ? 'border-blue-500/50 bg-blue-500/10 text-blue-300'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
          <div className="text-sm text-slate-300 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span>Simulasi langkah-demi-langkah</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-slate-400">
                  <th className="text-left px-2 py-1">Ref</th>
                  {Array.from({ length: frames }).map((_, i) => (
                    <th key={i} className="text-center px-2 py-1">Frame {i + 1}</th>
                  ))}
                  <th className="text-center px-2 py-1">Hit/Fault</th>
                </tr>
              </thead>
              <tbody>
                {result.steps.map((s, i) => (
                  <tr key={i} className="border-t border-slate-800">
                    <td className="px-2 py-1 font-mono">{s.page}</td>
                    {s.frame.map((v, fi) => (
                      <td key={fi} className="px-2 py-1 text-center font-mono">
                        {v === null ? '—' : v}
                      </td>
                    ))}
                    <td className={`px-2 py-1 text-center font-semibold ${s.hit ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {s.hit ? 'HIT' : 'FAULT'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-md border border-slate-800 bg-slate-900 p-3">
              <div className="text-slate-300 text-sm">Total Ref</div>
              <div className="text-2xl font-semibold">{refs.length}</div>
            </div>
            <div className="rounded-md border border-slate-800 bg-slate-900 p-3">
              <div className="text-slate-300 text-sm">Hits</div>
              <div className="text-2xl font-semibold text-emerald-300">{result.hits}</div>
            </div>
            <div className="rounded-md border border-slate-800 bg-slate-900 p-3">
              <div className="text-slate-300 text-sm">Faults</div>
              <div className="text-2xl font-semibold text-rose-300">{result.faults}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <h3 className="text-sm font-semibold mb-3">Penjelasan Singkat</h3>
        <ul className="list-disc pl-6 space-y-2 text-sm text-slate-300">
          <li>FIFO: Page yang masuk paling awal akan diganti terlebih dahulu ketika terjadi page fault.</li>
          <li>LRU: Menggantikan page yang paling lama tidak digunakan.</li>
          <li>Optimal: Secara teoritis terbaik dengan mengganti page yang paling lama tidak akan digunakan di masa depan.</li>
        </ul>
      </div>
    </section>
  );
}
