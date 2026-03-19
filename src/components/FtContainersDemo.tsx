import { useState, useEffect, useRef } from 'react';

const OUTPUTS: Record<string, string[]> = {
  list: [
    "================================",
    "\tTEST FT::LIST",
    "================================",
    "",
    "l1 (default) (size=0): ",
    "l2 (fill) (size=5): 42 42 42 42 42 ",
    "",
    "l1 after push_back (size=5): 10 20 30 40 50 ",
    "l1 after push_front (size=7): 0 5 10 20 30 40 50 ",
    "",
    "Front: 0, Back: 50",
    "",
    "After insert(999) at pos 2 (size=8): 0 5 999 10 20 30 40 50 ",
    "",
    "After erase pos 1 (size=7): 0 999 10 20 30 40 50 ",
    "",
    "After pop_front (size=6): 999 10 20 30 40 50 ",
    "After pop_back (size=5): 999 10 20 30 40 ",
    "",
    "l3 (copy of l1) (size=5): 999 10 20 30 40 ",
    "l4 (assigned from l2) (size=5): 42 42 42 42 42 ",
    "",
    "l1 reversed: 40 30 20 10 999 ",
    "",
    "l1 resized to 3 (size=3): 999 10 20 ",
    "l1 resized to 6 with value 77 (size=6): 999 10 20 77 77 77 ",
    "",
    "l5 before remove (size=10): 0 1 2 0 1 2 0 1 2 0 ",
    "l5 after remove(1) (size=7): 0 2 0 2 0 2 0 ",
    "",
    "l6 before unique (size=7): 1 1 2 3 3 3 4 ",
    "l6 after unique (size=4): 1 2 3 4 ",
    "",
    "l7 before sort (size=5): 5 2 8 1 9 ",
    "l7 after sort (size=5): 1 2 5 8 9 ",
    "",
    "l7 before reverse (size=5): 1 2 5 8 9 ",
    "l7 after reverse (size=5): 9 8 5 2 1 ",
    "",
    "l8 before merge (size=3): 1 3 5 ",
    "l9 before merge (size=3): 2 4 6 ",
    "l8 after merge (size=6): 1 2 3 4 5 6 ",
    "l9 after merge (size=0): ",
    "",
    "l10 before splice (size=3): 1 2 3 ",
    "l11 before splice (size=3): 10 11 12 ",
    "l10 after splice (size=6): 1 10 11 12 2 3 ",
    "l11 after splice (size=0): ",
    "",
    "la == lb: 1",
    "la != lb: 0",
    "After adding 4 to lb:",
    "la < lb: 1",
    "la > lb: 0",
    "la <= lb: 1",
    "la >= lb: 0",
    "",
    "la before clear (size=3): 1 2 3 ",
    "la after clear (size=0): ",
    "Is la empty? yes",
    "",
    "List tests completed successfully!",
  ],
  vector: [
    "================================",
    "\tTEST FT::VECTOR",
    "================================",
    "",
    "v1 initial [size=0, capacity=0] : (empty)",
    "After push_back(1..5) [size=5, capacity=8] : 10 20 30 40 50 ",
    "v1.at(2) = 30",
    "v1.at(10) = Exception: vector::_M_range_check",
    "Front: 10, Back: 50",
    "Data ptr: 0x55a3f2b01eb0",
    "After resize(8,60) [size=8, capacity=8] : 10 20 30 40 50 60 60 60 ",
    "After pop_back() twice [size=6, capacity=8] : 10 20 30 40 50 60 ",
    "Using iterators: 10 20 30 40 50 60 ",
    "Reverse order: 60 50 40 30 20 10 ",
    "After insert 42 at pos 4 [size=7, capacity=16] : 10 20 30 40 42 50 60 ",
    "After erase(pos 3) [size=6, capacity=16] : 10 20 30 42 50 60 ",
    "v1 after swap() [size=2, capacity=2] : 111 222 ",
    "v2 after swap() [size=6, capacity=16] : 10 20 30 42 50 60 ",
    "",
    "Comparisons:",
    "a == b ? 1",
    "a != b ? 0",
    "a < c ? 1",
    "a > c ? 0",
    "",
    "Max size possible: 4611686018427387903",
    "",
    "Vector tests completed successfully.",
  ],
  stack: [
    "================================",
    "\tTEST FT::STACK",
    "================================",
    "",
    "Initially empty? yes",
    "Pushed: 10, top = 10",
    "Pushed: 20, top = 20",
    "Pushed: 30, top = 30",
    "Pushed: 40, top = 40",
    "Pushed: 50, top = 50",
    "Stack size: 5",
    "Top element: 50",
    "Popping elements: 50 40 30 20 10 ",
    "Empty after pop? yes",
    "Compare stacks:",
    "a == b ? 0",
    "a != b ? 1",
    "a <  b ? 1",
    "a >  b ? 0",
    "a <= b ? 1",
    "a >= b ? 0",
    "",
    "Stack tests completed successfully.",
  ],
  queue: [
    "================================",
    "\tTEST FT::QUEUE",
    "================================",
    "",
    "Initially empty? yes",
    "Pushed: 10, front = 10, back = 10",
    "Pushed: 20, front = 10, back = 20",
    "Pushed: 30, front = 10, back = 30",
    "Pushed: 40, front = 10, back = 40",
    "Pushed: 50, front = 10, back = 50",
    "Queue size: 5",
    "Popping elements: 10 20 30 40 50 ",
    "Empty after pop? yes",
    "Compare queues:",
    "a == b ? 1",
    "a < b ? 1",
    "",
    "Queue tests completed successfully.",
  ],
  map: [
    "================================",
    "\tTEST FT::MAP",
    "================================",
    "",
    "Size: 5",
    "10 => ten",
    "25 => twenty-five",
    "30 => thirty",
    "42 => forty-two",
    "50 => fifty",
    "m[10] = ten",
    "m[42] = forty-two",
    "m[100] =  (insertion par défaut)",
    "Size after operator[]: 6",
    "Found key 25 => twenty-five",
    "Count(42) = 1",
    "Count(123) = 0",
    "Erasing key 10...",
    "Size: 5",
    "Erasing iterator (first element)...",
    "Size: 4",
    "lower_bound(25) => 25",
    "upper_bound(25) => 30",
    "Before swap: m size = 4, m2 size = 2",
    "After swap: m size = 2, m2 size = 4",
    "m == m3 ? true",
    "m != m3 ? false",
    "After clear, size: 0",
    "Empty ? true",
    "",
    "Map tests completed successfully.",
  ],
};

const CONTAINERS = ['list', 'vector', 'stack', 'queue', 'map'] as const;
type Container = typeof CONTAINERS[number];

const CONTAINER_COLORS: Record<Container, string> = {
  list:   '#00FF9C',
  vector: '#61DAFB',
  stack:  '#FFB830',
  queue:  '#FF4D6A',
  map:    '#B57BFF',
};

export default function FtContainersDemo() {
  const [active, setActive]       = useState<Container>('list');
  const [displayed, setDisplayed] = useState<string[]>([]);
  const [lineIdx, setLineIdx]     = useState(0);
  const [running, setRunning]     = useState(false);
  const termRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lines = OUTPUTS[active];
  const color = CONTAINER_COLORS[active];

  // Start animation when container changes
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDisplayed([]);
    setLineIdx(0);
    setRunning(true);
  }, [active]);

  // Animate lines one by one
  useEffect(() => {
    if (!running) return;
    if (lineIdx >= lines.length) {
      setRunning(false);
      return;
    }
    const delay = lines[lineIdx] === '' ? 40 : 18;
    timerRef.current = setTimeout(() => {
      setDisplayed(prev => [...prev, lines[lineIdx]]);
      setLineIdx(i => i + 1);
    }, delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [running, lineIdx, lines]);

  // Auto-scroll
  useEffect(() => {
    if (termRef.current)
      termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [displayed]);

  const formatLine = (line: string) => {
    if (line.includes('TEST FT::')) {
      return <span style={{ color }}>{line}</span>;
    }
    if (line.includes('completed successfully')) {
      return <span style={{ color: '#00FF9C' }}>{line}</span>;
    }
    if (line.includes('Exception:')) {
      return <span style={{ color: '#FF4D6A' }}>{line}</span>;
    }
    if (line.startsWith('===')) {
      return <span style={{ color: '#3A5060' }}>{line}</span>;
    }
    // Key => value for map
    if (line.match(/^\d+ => /)) {
      const parts = line.split(' => ');
      return (
        <>
          <span style={{ color }}>{parts[0]}</span>
          <span style={{ color: '#6B8A9A' }}> =&gt; </span>
          <span style={{ color: '#D4DFE8' }}>{parts.slice(1).join(' => ')}</span>
        </>
      );
    }
    // highlight numbers inline
    return (
      <span style={{ color: '#D4DFE8' }}>
        {line.split(/(\b\d+\b)/).map((part, i) =>
          /^\d+$/.test(part)
            ? <span key={i} style={{ color: '#FFB830' }}>{part}</span>
            : part
        )}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* Container selector */}
      <div className="flex gap-2 flex-wrap">
        {CONTAINERS.map(c => {
          const col = CONTAINER_COLORS[c];
          const isActive = active === c;
          return (
            <button
              key={c}
              onClick={() => setActive(c)}
              className="font-mono text-xs px-3 py-1.5 rounded border transition-all duration-200 cursor-pointer"
              style={{
                background:  isActive ? col + '18' : 'transparent',
                borderColor: isActive ? col        : 'var(--color-border-base)',
                color:       isActive ? col        : 'var(--color-text-muted)',
              }}
            >
              ft::{c}
            </button>
          );
        })}
      </div>

      {/* Terminal */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: 'var(--color-border-base)' }}
      >
        {/* Chrome bar */}
        <div
          className="flex items-center justify-between px-4 py-2.5 border-b"
          style={{ borderColor: 'var(--color-border-base)', background: 'rgba(0,0,0,0.5)' }}
        >
          <div className="flex items-center gap-2">
            {['#FF5F57','#FFBD2E','#28C941'].map(c => (
              <span key={c} className="w-3 h-3 rounded-full opacity-80" style={{ background: c }} />
            ))}
            <span className="font-mono text-xs text-text-muted ml-2">
              ./ft_containers {active}
            </span>
          </div>
          {running && (
            <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color }}>
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: color }}
              />
              running
            </span>
          )}
          {!running && displayed.length > 0 && (
            <span className="font-mono text-xs" style={{ color: '#00FF9C' }}>
              ✓ exit 0
            </span>
          )}
        </div>

        {/* Output */}
        <div
          ref={termRef}
          className="p-4 overflow-y-auto"
          style={{
            height: '320px',
            background: '#060A0E',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '12px',
            lineHeight: '1.6',
          }}
        >
          {/* Command line */}
          <div className="mb-2">
            <span style={{ color: '#00FF9C' }}>~/ft_containers</span>
            <span style={{ color: '#6B8A9A' }}> ❯ </span>
            <span style={{ color: '#D4DFE8' }}>./ft_containers {active}</span>
          </div>

          {displayed.map((line, i) => (
            <div key={i} style={{ minHeight: '1.6em' }}>
              {formatLine(line)}
            </div>
          ))}

          {running && (
            <span
              className="inline-block w-2 h-4 align-middle"
              style={{ background: color, animation: 'blink 1s step-end infinite' }}
            />
          )}
        </div>
      </div>

      <p className="font-mono text-xs text-text-muted">
        Cliquez sur un conteneur pour rejouer le test
      </p>
    </div>
  );
}