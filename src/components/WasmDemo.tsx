import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';

interface WasmObject {
  key: string;
  label: string;
  path: string;
}

interface ScopModule {
  _scop_pause: () => void;
  _scop_resume: () => void;
  _scop_render_thumbnail: () => void;
  _scop_reload_obj: (ptr: number) => void;
  stringToNewUTF8: (s: string) => number;
  _free: (ptr: number) => void;
}

interface FtVoxModule {
  _ft_vox_pause: () => void;
  _ft_vox_resume: () => void;
}

declare global {
  interface Window {
    Module?: Partial<ScopModule> & {
      onRuntimeInitialized?: () => void;
      canvas?: HTMLCanvasElement | null;
      locateFile?: (path: string) => string;
    };
    FtVoxModule?: (config: object) => Promise<FtVoxModule>;
  }
}

interface WasmDemoProps {
  base: string;
  name: string;
  canvasId: string;
  aspectRatio?: string;
  controls?: string;
  objects?: WasmObject[];
}

export default function WasmDemo({
  base,
  name,
  canvasId,
  aspectRatio = '4/3',
  controls,
  objects,
}: WasmDemoProps) {
  const [running,    setRunning]    = useState(false);
  const [loaded,     setLoaded]     = useState(false);
  const [activeObj,  setActiveObj]  = useState(objects?.[0]?.key ?? '');
  const [loadingObj, setLoadingObj] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const scopModuleRef  = useRef<Partial<ScopModule> | null>(null);
  const ftvoxModuleRef = useRef<FtVoxModule | null>(null);
  const scriptRef      = useRef<HTMLScriptElement | null>(null);
  const containerRef   = useRef<HTMLDivElement | null>(null);

  const isFtVox = name === 'ft_vox';

  useEffect(() => {
    if (scriptRef.current) return;

    const script = document.createElement('script');
    script.src = `${base}/${name}/${name}.js`;
    script.async = true;

    if (isFtVox) {
      script.onload = () => {
        if (!window.FtVoxModule) return;
        window.FtVoxModule({
          canvas: document.getElementById(canvasId) as HTMLCanvasElement,
          locateFile: (path: string) => `${base}/${name}/${path}`,
          onRuntimeInitialized(this: FtVoxModule) {
            ftvoxModuleRef.current = this;
            setLoaded(true);
          },
        });
      };
    } else {
      window.Module = {
        canvas: document.getElementById(canvasId) as HTMLCanvasElement,
        locateFile(path: string) {
          return `${base}/${name}/${path}`;
        },
        onRuntimeInitialized() {
          scopModuleRef.current = window.Module as Partial<ScopModule>;
          setLoaded(true);
        },
      };
    }

    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (isFtVox) ftvoxModuleRef.current?._ft_vox_pause?.();
      else scopModuleRef.current?._scop_pause?.();
    };
  }, [base, name, canvasId, isFtVox]);

  const pause = () => {
    if (isFtVox) ftvoxModuleRef.current?._ft_vox_pause?.();
    else scopModuleRef.current?._scop_pause?.();
  };

  const resume = () => {
    if (isFtVox) ftvoxModuleRef.current?._ft_vox_resume?.();
    else scopModuleRef.current?._scop_resume?.();
  };

  const togglePlay = () => {
    if (!loaded) return;
    if (running) { pause(); setRunning(false); }
    else         { resume(); setRunning(true); }
  };

  const changeObj = (obj: WasmObject) => {
    const m = scopModuleRef.current;
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
    const BLOCKED = ['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
                     'KeyW','KeyS','KeyA','KeyD','KeyZ','KeyQ','Escape'];
    const onKeyDown = (e: KeyboardEvent) => { if (BLOCKED.includes(e.code)) e.preventDefault(); };
    window.addEventListener('keydown', onKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [running]);

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) { el.requestFullscreen(); setFullscreen(true); }
    else { document.exitFullscreen(); setFullscreen(false); }
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-3 w-full">

      {objects && objects.length > 0 && (
        <div className="flex gap-2">
          {objects.map(obj => (
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
      )}

      <div className="relative w-full rounded-xl overflow-hidden" style={{ background: '#1a1a1a' }}>
        <canvas
          id={canvasId}
          className="w-full block"
          style={{
            aspectRatio,
            filter: !running ? 'grayscale(1) brightness(0.7)' : 'none',
            transition: 'filter 0.4s ease',
          }}
        />

        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
               style={{ background: 'rgba(6,10,14,0.85)' }}>
            <div className="w-6 h-6 rounded-full border-2 animate-spin"
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
              <FontAwesomeIcon icon={faPlay} style={{ color: 'var(--color-accent)', fontSize: '20px' }} />
            </button>
          </div>
        )}
      </div>

      {loaded && (
        <div className="flex items-center justify-between">
          <button
            onClick={togglePlay}
            className="flex items-center gap-2 font-mono text-xs px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer"
            style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)', background: 'transparent' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,156,0.08)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            {running
              ? <><FontAwesomeIcon icon={faPause} className="w-3" /> Pause</>
              : <><FontAwesomeIcon icon={faPlay}  className="w-3" /> Lancer</>
            }
          </button>

          <div className="flex items-center gap-3">
            {controls && (
              <span className="font-mono text-xs text-text-muted hidden sm:block">{controls}</span>
            )}
            <button
              onClick={toggleFullscreen}
              className="text-text-muted hover:text-accent transition-colors duration-200"
              title="Plein écran"
            >
              {fullscreen
                ? <FontAwesomeIcon icon={faCompress} />
                : <FontAwesomeIcon icon={faExpand} />
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}