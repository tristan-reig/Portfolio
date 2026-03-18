import { useState, type JSX } from 'react';
import projects from '../data/projects.json';
import ScopDemo from './ScopDemo';
import ScreenshotGallery from './ScreenshotGallery';
import MinishellDemo from './MinishellDemo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDesktop, faCube, faTerminal, faImage,
  faXmark, faClock, faFilter, faArrowUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import { faGithub as faGithubBrand } from '@fortawesome/free-brands-svg-icons';

interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  longDescription: string;
  tech: string[];
  demoType: string;
  github?: string;
  demoUrl?: string;
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
  iframe:      'Live demo',
  wasm:        'WebAssembly',
  terminal:    'Terminal',
  screenshots: 'Screenshots',
};

const DEMO_ICON_COMPONENT: Record<string, JSX.Element> = {
  iframe:      <FontAwesomeIcon icon={faDesktop} />,
  wasm:        <FontAwesomeIcon icon={faCube} />,
  terminal:    <FontAwesomeIcon icon={faTerminal} />,
  screenshots: <FontAwesomeIcon icon={faImage} />,
};

export default function ProjectGallery({ base = '', wsUrl = '' }: { base?: string; wsUrl?: string }) {
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
              {cat === 'Tous' && <FontAwesomeIcon icon={faFilter} className="text-xs" />}
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
                  <FontAwesomeIcon icon={faClock} className="text-xs" />
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
                <FontAwesomeIcon icon={faXmark} />
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

              {selectedProject.demoType === 'wasm' && selectedProject.title === 'scop' ? (
                <ScopDemo base={base.replace(/\/$/, '')} />
              ) : selectedProject.demoType === 'screenshots' ? (
                <ScreenshotGallery
                  projectKey={selectedProject.title.toLowerCase()}
                  base={base.replace(/\/$/, '')}
                  count={(selectedProject as any).screenshotCount ?? 0}
                />
              ) : selectedProject.demoType === 'terminal' && selectedProject.title === 'minishell' ? (
                <MinishellDemo wsUrl={wsUrl} />
              ) : selectedProject.demoType === 'iframe' && selectedProject.demoUrl ? (
                <div className="w-full rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border-base)', height: '480px' }}>
                  <iframe
                    src={selectedProject.demoUrl}
                    className="w-full h-full"
                    title={`Démo ${selectedProject.title}`}
                  />
                </div>
              ) : (
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
              )}

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
                  <FontAwesomeIcon icon={faClock} className="text-xs" />
                  <span className="font-mono text-xs">{selectedProject.year || '—'}</span>
                </div>
                <a
                  href={selectedProject.github ?? '#'}
                  className="font-mono text-xs px-5 py-2.5 rounded-lg border border-accent/40 text-accent transition-all duration-150 hover:bg-accent/10 flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faGithubBrand} />
                  Code source
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}