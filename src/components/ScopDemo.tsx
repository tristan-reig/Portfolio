import { useState, useEffect, useRef } from 'react';

const OBJECTS = [
  { key: 'teapot',  label: 'Théière',  path: 'assets/teapot.obj' },
  { key: 'voiture', label: 'Voiture',  path: 'assets/voiture.obj' },
  { key: 'airboat', label: 'Airboat',  path: 'assets/airboat.obj' },
];

interface ScopModule {
  ccall: (fn: string, ret: string, types: string[], args: unknown[]) => unknown;
  _scop_pause: () => void;
  _scop_resume: () => void;
  _scop_render_thumbnail: () => void;
  _scop_reload_obj: (ptr: number) => void;
  stringToNewUTF8: (s: string) => number;
  _free: (ptr: number) => void;
}

declare global {
  interface Window {
    Module?: Partial<ScopModule> & {
      onRuntimeInitialized?: () => void;
      canvas?: HTMLCanvasElement | null;
      locateFile?: (path: string) => string;
    };
  }
}

export default function ScopDemo({ base }: { base: string }) {
  const [running,     setRunning]     = useState(false);
  const [loaded,      setLoaded]      = useState(false);
  const [activeObj,   setActiveObj]   = useState('teapot');
  const [fullscreen,  setFullscreen]  = useState(false);
  const [loadingObj,  setLoadingObj]  = useState(false);
  const moduleRef = useRef<Partial<ScopModule> | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scriptRef.current) return;

    window.Module = {
      canvas: document.getElementById('scop-canvas') as HTMLCanvasElement,
      locateFile(path: string) {
        return `${base}/scop/${path}`;
      },
      onRuntimeInitialized() {
        moduleRef.current = window.Module as Partial<ScopModule>;
        setLoaded(true);
      },
    };

    const script = document.createElement('script');
    script.src = `${base}/scop/scop.js`;
    script.async = true;
    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (moduleRef.current?._scop_pause) moduleRef.current._scop_pause();
    };
  }, [base]);

  const togglePlay = () => {
    const m = moduleRef.current;
    if (!m) return;
    if (running) {
      m._scop_pause?.();
      setRunning(false);
    } else {
      m._scop_resume?.();
      setRunning(true);
    }
  };

  const changeObj = (obj: typeof OBJECTS[0]) => {
    const m = moduleRef.current;
    if (!m || loadingObj) return;
    setLoadingObj(true);
    setActiveObj(obj.key);

    const wasRunning = running;
    m._scop_pause?.();

    const ptr = (m as ScopModule).stringToNewUTF8?.(obj.path);
    if (ptr !== undefined) {
      m._scop_reload_obj?.(ptr as number);
      (m as ScopModule)._free?.(ptr as number);
    }

    m._scop_render_thumbnail?.();
    if (wasRunning) m._scop_resume?.();
    setLoadingObj(false);
  };

  useEffect(() => {
    if (!running) return;

    const BLOCKED = [
      'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'KeyW', 'KeyS', 'KeyA', 'KeyD', 'Escape',
    ];

    const onKeyDown = (e: KeyboardEvent) => {
      if (BLOCKED.includes(e.code)) e.preventDefault();
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [running]);
  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col gap-3 w-full">

      <div className="flex gap-2">
        {OBJECTS.map(obj => (
          <button
            key={obj.key}
            onClick={() => changeObj(obj)}
            disabled={!loaded || loadingObj}
            className="font-mono text-xs px-3 py-1.5 rounded border transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background:  activeObj === obj.key ? 'rgba(0,255,156,0.12)' : 'transparent',
              borderColor: activeObj === obj.key ? 'var(--color-accent)'  : 'var(--color-border-base)',
              color:       activeObj === obj.key ? 'var(--color-accent)'  : 'var(--color-text-secondary)',
            }}
          >
            {obj.label}
          </button>
        ))}
      </div>

      <div className="relative w-full rounded-xl overflow-hidden" style={{ background: '#1a1a1a' }}>
        <canvas
          id="scop-canvas"
          width={800}
          height={800}
          className="w-full block"
          style={{
            aspectRatio: '1',
            filter: !running ? 'grayscale(1) brightness(0.7)' : 'none',
            transition: 'filter 0.4s ease',
          }}
        />

        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
               style={{ background: 'rgba(6,10,14,0.85)' }}>
            <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin"
                 style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
            <span className="font-mono text-xs text-text-muted">Chargement du wasm…</span>
          </div>
        )}

        {loaded && !running && (
          <div className="absolute inset-0 flex items-center justify-center"
               style={{ background: 'rgba(0,0,0,0.3)' }}>
            <button
              onClick={togglePlay}
              className="flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all duration-200 hover:scale-110"
              style={{ borderColor: 'var(--color-accent)', background: 'rgba(0,255,156,0.12)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-accent)">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {loaded && (
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={togglePlay}
              className="flex items-center gap-2 font-mono text-xs px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer"
              style={{
                borderColor: 'var(--color-accent)',
                color:       'var(--color-accent)',
                background:  'transparent',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,156,0.08)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              {running ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21"/>
                  </svg>
                  Lancer
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-text-muted hidden sm:block">
              WASD · ↑↓←→ · Espace (texture)
            </span>
            <button
              onClick={toggleFullscreen}
              className="text-text-muted hover:text-accent transition-colors duration-200"
              title="Plein écran"
            >
              {fullscreen ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                     style={{ stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round' }}>
                  <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
                  <path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                     style={{ stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round' }}>
                  <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
                  <path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}