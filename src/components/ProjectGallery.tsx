import { useState, type JSX } from 'react';
import projects from '../data/projects.json';

interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  longDescription: string;
  tech: string[];
  demoType: string;
  github?: string;
  highlights: string[];
  year?: string;
}

const CATEGORY_COLOR: Record<string, string> = {
  Web:       '#61DAFB',
  Graphisme: '#00FF9C',
  Logiciel:  '#FFB830',
  Système:   '#FF4D6A',
};

const DEMO_LABEL: Record<string, string> = {
  iframe:   'Live demo',
  wasm:     'WebAssembly',
  terminal: 'Terminal',
};

function IconMonitor({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  );
}

function IconCube({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}

function IconTerminal({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5"/>
      <line x1="12" y1="19" x2="20" y2="19"/>
    </svg>
  );
}

function IconGithub({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

function IconExternalLink({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}

function IconClose({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function IconClock({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function IconFilter({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  );
}

const DEMO_ICON_COMPONENT: Record<string, JSX.Element> = {
  iframe:   <IconMonitor />,
  wasm:     <IconCube />,
  terminal: <IconTerminal />,
};

export default function ProjectGallery() {
  const [filter, setFilter]                   = useState('Tous');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const categories = ['Tous', 'Web', 'Graphisme', 'Logiciel', 'Système'];

  const displayedProjects = filter === 'Tous'
    ? (projects as Project[])
    : (projects as Project[]).filter(p => p.category === filter);

  const accentFor = (cat: string) => CATEGORY_COLOR[cat] ?? '#00FF9C';

  return (
    <section id="projets" className="py-16">

      <div className="flex items-baseline gap-4 mb-2">
        <span className="font-mono text-xs text-text-muted">02.</span>
        <h2 className="text-3xl font-bold text-text-primary tracking-tight">Sélection de projets</h2>
      </div>
      <div
        className="mb-10 h-px"
        style={{ background: 'linear-gradient(90deg, var(--color-accent), transparent)', width: 'min(260px,100%)' }}
      />

      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map(cat => {
          const active = filter === cat;
          const col    = accentFor(cat);
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="font-mono text-xs px-4 py-1.5 rounded border transition-all duration-200 cursor-pointer flex items-center gap-1.5"
              style={{
                background:  active ? col + '1A' : 'transparent',
                borderColor: active ? col        : 'var(--color-border-base)',
                color:       active ? col        : 'var(--color-text-secondary)',
              }}
            >
              {cat === 'Tous' && <IconFilter size={11} />}
              {cat}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {displayedProjects.map(project => {
          const col = accentFor(project.category);
          return (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="text-left group rounded-xl border bg-bg-card p-6 flex flex-col gap-4 transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              style={{ borderColor: 'var(--color-border-base)' }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.borderColor = col + '60';
                el.style.background  = 'var(--color-bg-card-hover)';
                el.style.transform   = 'translateY(-2px)';
                el.style.boxShadow   = `0 8px 32px ${col}0D`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.borderColor = 'var(--color-border-base)';
                el.style.background  = 'var(--color-bg-card)';
                el.style.transform   = '';
                el.style.boxShadow   = '';
              }}
            >
              <div className="flex justify-between items-center">
                <span
                  className="font-mono text-xs px-2 py-0.5 rounded border"
                  style={{ color: col, borderColor: col + '55', background: col + '12' }}
                >
                  {project.category}
                </span>
                <div className="flex items-center gap-1.5 text-text-muted">
                  <IconClock size={11} />
                  <span className="font-mono text-xs">{project.year || '—'}</span>
                </div>
              </div>

              <div className="flex justify-between items-start gap-2">
                <h3
                  className="text-xl font-bold text-text-primary group-hover:text-accent transition-colors duration-200 leading-tight"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {project.title}
                </h3>
                <span
                  className="flex items-center gap-1.5 font-mono text-xs px-2 py-1 rounded shrink-0 mt-0.5"
                  style={{ background: 'rgba(0,0,0,0.4)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-base)' }}
                >
                  {DEMO_ICON_COMPONENT[project.demoType]}
                  {DEMO_LABEL[project.demoType]}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-text-secondary">{project.description}</p>

              <ul className="space-y-1">
                {project.highlights.map(h => (
                  <li key={h} className="font-mono text-xs text-text-muted flex items-start gap-2">
                    <span style={{ color: col }} className="mt-px shrink-0">▸</span>
                    {h}
                  </li>
                ))}
              </ul>

              <div
                className="flex flex-wrap gap-1.5 pt-3 border-t mt-auto"
                style={{ borderColor: 'var(--color-border-base)' }}
              >
                {project.tech.map(tag => (
                  <span
                    key={tag}
                    className="font-mono text-xs px-2.5 py-1 rounded"
                    style={{ background: 'rgba(0,0,0,0.4)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-base)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(6,10,14,0.88)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border flex flex-col animate-fade-up"
            style={{
              background:  'var(--color-bg-card)',
              borderColor: accentFor(selectedProject.category) + '40',
              boxShadow:   `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px ${accentFor(selectedProject.category)}15`,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: 'var(--color-border-base)' }}>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-text-muted">{String(selectedProject.id).padStart(2, '0')}</span>
                <h3 className="text-xl font-bold text-accent" style={{ fontFamily: 'var(--font-mono)' }}>
                  {selectedProject.title}
                </h3>
                <span
                  className="font-mono text-xs px-2 py-0.5 rounded border hidden sm:inline"
                  style={{
                    color:       accentFor(selectedProject.category),
                    borderColor: accentFor(selectedProject.category) + '55',
                    background:  accentFor(selectedProject.category) + '12',
                  }}
                >
                  {selectedProject.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-text-muted hover:text-text-primary w-8 h-8 flex items-center justify-center rounded border border-border-base hover:border-text-secondary transition-all duration-150 cursor-pointer"
              >
                <IconClose />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              <p className="text-sm leading-relaxed text-text-secondary">{selectedProject.longDescription}</p>

              <div>
                <p className="font-mono text-xs text-text-muted mb-3 uppercase tracking-widest">Points clés</p>
                <ul className="space-y-2">
                  {selectedProject.highlights.map(h => (
                    <li key={h} className="font-mono text-sm text-text-secondary flex items-start gap-3">
                      <span className="text-accent mt-px shrink-0">▸</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="w-full aspect-video rounded-xl border flex flex-col items-center justify-center gap-3"
                style={{ background: 'var(--color-bg-deep)', borderColor: 'var(--color-border-base)', color: 'var(--color-text-muted)' }}
              >
                <span className="opacity-40" style={{ transform: 'scale(2.5)', display: 'block' }}>
                  {DEMO_ICON_COMPONENT[selectedProject.demoType]}
                </span>
                <span className="font-mono text-xs text-text-muted mt-3">
                  [ {DEMO_LABEL[selectedProject.demoType]} — coming soon ]
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedProject.tech.map(tag => (
                  <span
                    key={tag}
                    className="font-mono text-xs px-3 py-1 rounded border text-text-secondary"
                    style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'var(--color-border-base)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-text-muted">
                  <IconClock size={13} />
                  <span className="font-mono text-xs">{selectedProject.year || '—'}</span>
                </div>
                <a
                  href={selectedProject.github ?? '#'}
                  className="font-mono text-xs px-5 py-2.5 rounded-lg border border-accent/40 text-accent transition-all duration-150 hover:bg-accent/10 flex items-center gap-2"
                >
                  <IconGithub size={13} />
                  Code source
                  <IconExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}