import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTerminal, faCircle } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

const WS_URL = (import.meta as any).env?.PUBLIC_MINISHELL_WS_URL ?? 'ws://localhost:3001';

export default function MinishellDemo({ wsUrl = WS_URL }: { wsUrl?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef      = useRef<Terminal | null>(null);
  const wsRef        = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      theme: {
        background:  '#060A0E',
        foreground:  '#D4DFE8',
        cursor:      '#00FF9C',
        green:       '#00FF9C',
        red:         '#FF4D6A',
        brightBlack: '#3A5060',
      },
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize:   13,
      cursorBlink: true,
      convertEol:  true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();
    termRef.current = term;

    term.writeln('\x1b[90mConnexion au serveur minishell…\x1b[0m');

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      term.writeln('\x1b[32m✓ Connecté — minishell prêt\x1b[0m');
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'stdout') term.write(msg.data);
        if (msg.type === 'exit')   term.writeln(`\x1b[90m[process exited with code ${msg.code}]\x1b[0m`);
      } catch {}
    };

    ws.onclose = () => {
      setConnected(false);
      term.writeln('\x1b[90m[connexion fermée]\x1b[0m');
    };

    ws.onerror = () => {
      setConnected(false);
      term.writeln('\x1b[31m✗ Impossible de se connecter au serveur\x1b[0m');
    };

    term.onData(data => {
      if (ws.readyState === WebSocket.OPEN)
        ws.send(JSON.stringify({ data }));
    });

    const observer = new ResizeObserver(() => fitAddon.fit());
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      ws.close();
      term.dispose();
    };
  }, []);

  return (
    <div className="flex flex-col gap-3 w-full">
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: 'var(--color-border-base)' }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--color-border-base)', background: 'rgba(0,0,0,0.5)' }}
        >
          <div className="flex items-center gap-2">
            {['#FF5F57','#FFBD2E','#28C941'].map(c => (
              <span key={c} className="w-3 h-3 rounded-full opacity-80" style={{ background: c }} />
            ))}
            <span className="font-mono text-xs text-text-muted ml-2 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faTerminal} className="text-xs" />
              minishell
            </span>
          </div>
          <span
            className="flex items-center gap-1.5 font-mono text-xs"
            style={{ color: connected ? 'var(--color-accent)' : 'var(--color-danger)' }}
          >
            <FontAwesomeIcon icon={faCircle} className="text-[8px]" />
            {connected ? 'connecté' : 'déconnecté'}
          </span>
        </div>

        <div
          ref={containerRef}
          style={{ height: '320px', background: '#060A0E', padding: '8px' }}
        />
      </div>

      <p className="font-mono text-xs text-text-muted">
        Ctrl+C · Ctrl+L (clear) · ↑↓ historique
      </p>
    </div>
  );
}