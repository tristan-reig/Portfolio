import { useState, useEffect } from 'react';

const LANGAGES: { label: string; color: string }[] = [
  { label: 'C', color: '#555599' },
  { label: 'C++', color: '#F34B7D' },
  { label: 'Java', color: '#B07219' },
  { label: 'Python', color: '#3572A5' },
  { label: 'JavaScript / TypeScript', color: '#F7DF1E' },
];

const FRAMEWORKS: { label: string; color: string }[] = [
  { label: 'OpenGL', color: '#5586A4' },
  { label: 'React',  color: '#61DAFB' },
  { label: 'Astro',  color: '#FF7E33' },
  { label: 'Flask',  color: '#AAAAAA' },
  { label: 'Node.js',color: '#6CC24A' },
];

const LINES = [
  { prefix: '~/about',  text: 'Étudiant en L3, passionné par la programmation et la modélisation 3D.' },
  { prefix: '~/stack',  text: 'C · C++ · OpenGL · Java · Python · React · Astro' },
  { prefix: '~/status', text: 'À la recherche d\'un Master pour la rentrée 2026.' },
];

function TypingLine({
  text,
  delay = 0,
  onDone,
}: {
  text: string;
  delay?: number;
  onDone?: () => void;
}) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted]     = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) { onDone?.(); return; }
    const t = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), 22);
    return () => clearTimeout(t);
  }, [started, displayed, text]);

  const done = displayed.length >= text.length;
  return (
    <span>
      {displayed}
      {!done && started && <span className="cursor-blink" />}
    </span>
  );
}

function StackPill({ label, color }: { label: string; color: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      className="font-mono text-xs px-3 py-1 rounded border cursor-default transition-all duration-200"
      style={{
        borderColor:    hovered ? color + '80' : 'var(--color-border-base)',
        color:          hovered ? color        : 'var(--color-text-muted)',
        background:     hovered ? color + '12' : 'rgba(0,0,0,0.35)',
        boxShadow:      hovered ? `0 0 10px 1px ${color}22` : 'none',
        transform:      hovered ? 'translateY(-1px)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </span>
  );
}

export default function Hero() {
  const [linesDone, setLinesDone] = useState(0);

  const delays = LINES.reduce<number[]>((acc, _, i) => {
    const prev    = acc[i - 1] ?? 0;
    const prevLen = i === 0 ? 0 : LINES[i - 1].text.length;
    return [...acc, prev + prevLen * 22 + 400];
  }, []);

  return (
    <section id="about" className="pt-20 pb-14">

      <div className="mb-10 select-none relative">
        <h1 style={{ fontFamily: 'var(--font-display)' }}>
          <span
            className="block font-extrabold leading-none tracking-tighter text-text-secondary mb-1"
            style={{ fontSize: 'clamp(1.6rem, 4.5vw, 3rem)' }}
          >
            Tristan Reig
          </span>

          <span
            className="block font-extrabold leading-none tracking-tighter text-text-primary relative"
            style={{ fontSize: 'clamp(3rem, 10vw, 6.5rem)' }}
          >
            DEV<br />
            <span className="text-accent">POLYVALENT</span>

            <span
              aria-hidden="true"
              className="absolute inset-0 text-danger pointer-events-none"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 'inherit', fontSize: 'inherit', animation: 'glitch-1 4s steps(1) infinite' }}
            >
              DEV<br /><span className="text-danger">POLYVALENT</span>
            </span>

            <span
              aria-hidden="true"
              className="absolute inset-0 text-accent pointer-events-none"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 'inherit', fontSize: 'inherit', animation: 'glitch-2 4s steps(1) infinite 0.1s' }}
            >
              DEV<br />POLYVALENT
            </span>
          </span>
        </h1>

        <div
          className="mt-6 h-px"
          style={{ width: 'min(420px,100%)', background: 'linear-gradient(90deg, var(--color-accent), transparent)' }}
        />
      </div>

      <div
        className="rounded-xl border border-border-base bg-bg-card overflow-hidden animate-fade-up mb-8"
        style={{ maxWidth: '600px' }}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-base bg-black/30">
          {['#FF5F57', '#FFBD2E', '#28C941'].map(c => (
            <span key={c} className="size-3 rounded-full opacity-80" style={{ background: c }} />
          ))}
          <span className="font-mono text-xs text-text-muted ml-2">zsh — portfolio</span>
        </div>

        <div className="p-5 space-y-3">
          {LINES.map((line, i) => (
            <div
              key={i}
              className="font-mono text-sm leading-relaxed transition-opacity duration-200"
              style={{ opacity: i <= linesDone ? 1 : 0 }}
            >
              <span className="text-accent">{line.prefix}</span>
              <span className="text-text-muted"> ❯ </span>
              <span className="text-text-primary">
                {i <= linesDone && (
                  <TypingLine
                    text={line.text}
                    delay={delays[i]}
                    onDone={() => setLinesDone(d => Math.max(d, i + 1))}
                  />
                )}
              </span>
            </div>
          ))}
          {linesDone >= LINES.length && (
            <div className="font-mono text-sm text-accent animate-fade-in">
              ~ ❯ <span className="cursor-blink" />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-10 animate-fade-up" style={{ animationDelay: '160ms' }}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-text-muted w-24 shrink-0">Langages</span>
          {LANGAGES.map(s => <StackPill key={s.label} {...s} />)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-text-muted w-24 shrink-0">Frameworks</span>
          {FRAMEWORKS.map(s => <StackPill key={s.label} {...s} />)}
        </div>
      </div>

      <div
        className="flex flex-wrap gap-4 animate-fade-up"
        style={{ animationDelay: '240ms' }}
      >
        <a
          href="#projets"
          className="font-mono text-sm font-bold px-6 py-3 rounded-lg bg-accent text-bg-deep transition-all duration-200 hover:-translate-y-px hover:shadow-[0_0_24px_4px_rgba(0,255,156,0.28)]"
        >
          Voir les projets →
        </a>
        <a
          href="#contact"
          className="font-mono text-sm font-medium px-6 py-3 rounded-lg border border-border-base text-text-secondary transition-all duration-200 hover:border-accent/40 hover:text-accent"
        >
          Me contacter
        </a>
      </div>
    </section>
  );
}