import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const API_URL = 'https://portfolio-api-production-0433.up.railway.app/api';

interface FileEntry {
  path: string;
  sha: string;
}

interface ProjectCodeViewerProps {
  repoPath: string;
  projectName: string;
}

const PALETTE = ['#00FF9C', '#61DAFB', '#FFB830', '#D4DFE8', '#FF4D6A', '#B57BFF'];

function getFilename(path: string): string {
  return path.split('/').pop() ?? path;
}

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'c': case 'h': case 'cpp': case 'hpp': return 'cpp';
    case 'java': return 'java';
    case 'py': return 'python';
    case 'js': case 'jsx': return 'javascript';
    case 'ts': case 'tsx': return 'typescript';
    case 'html': return 'html';
    case 'css': return 'css';
    case 'json': return 'json';
    case 'md': return 'markdown';
    case 'sql': return 'sql';
    case 'frag': case 'vert': case 'glsl': return 'glsl';
    case 'sh': return 'bash';
    case 'makefile': return 'makefile';
    default: 
      if (filename.toLowerCase() === 'makefile') return 'makefile';
      return 'text';
  }
}

export default function ProjectCodeViewer({ repoPath, projectName }: ProjectCodeViewerProps) {
  const [files, setFiles]             = useState<FileEntry[]>([]);
  const [selected, setSelected]       = useState<string | null>(null);
  const [content, setContent]         = useState<string>('');
  const [loading, setLoading]         = useState(false);
  const [loadingTree, setLoadingTree] = useState(true);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set(['src', 'srcs', 'includes']));

  useEffect(() => {
    fetch(`${API_URL}/tree?repo=${encodeURIComponent(repoPath)}`)
      .then(r => r.json())
      .then((data: FileEntry[]) => {
        if (!Array.isArray(data)) throw new Error("Invalid API response");
        const filteredData = data.filter(f => !f.path.includes('.git/') && !f.path.includes('node_modules/'));
        setFiles(filteredData);
        setLoadingTree(false);
        if (filteredData.length > 0) {
          const first = filteredData.find(f => f.path.startsWith('src') || f.path.startsWith('includes')) || filteredData[0];
          if (first) selectFile(first.path);
        }
      })
      .catch(() => setLoadingTree(false));
  }, [repoPath]);

  const selectFile = (path: string) => {
    setSelected(path);
    setLoading(true);
    setContent('');
    fetch(`${API_URL}/file?repo=${encodeURIComponent(repoPath)}&path=${encodeURIComponent(path)}`)
      .then(r => r.json())
      .then(data => {
        setContent(typeof data.content === 'string' ? data.content : '// Fichier vide ou illisible');
        setLoading(false);
      })
      .catch(() => {
        setContent('// Erreur de chargement réseau');
        setLoading(false);
      });
  };

  const toggleFolder = (folder: string) => {
    setOpenFolders(prev => {
      const next = new Set(prev);
      next.has(folder) ? next.delete(folder) : next.add(folder);
      return next;
    });
  };

  const grouped: Record<string, FileEntry[]> = {};
  const rootFiles: FileEntry[] = [];

  files.forEach(f => {
    const parts = f.path.split('/');
    if (parts.length === 1) {
      rootFiles.push(f);
    } else {
      const folder = parts[0];
      if (!grouped[folder]) grouped[folder] = [];
      grouped[folder].push(f);
    }
  });

  const folderNames = Object.keys(grouped).sort();
  const currentLanguage = getLanguage(selected ? getFilename(selected) : '');

  return (
    <div
      className="w-full rounded-xl border overflow-hidden flex flex-col mt-4"
      style={{ borderColor: 'var(--color-border-base)', height: '480px' }}
    >
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b shrink-0"
        style={{ borderColor: 'var(--color-border-base)', background: 'rgba(0,0,0,0.5)' }}
      >
        {['#FF5F57','#FFBD2E','#28C941'].map(c => (
          <span key={c} className="w-3 h-3 rounded-full opacity-80" style={{ background: c }} />
        ))}
        <span className="font-mono text-xs text-text-muted ml-2">
          {projectName} — {selected ? getFilename(selected) : 'select a file'}
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          className="shrink-0 overflow-y-auto border-r"
          style={{ width: '200px', borderColor: 'var(--color-border-base)', background: 'rgba(0,0,0,0.3)' }}
        >
          {loadingTree ? (
            <div className="p-3 font-mono text-xs text-text-muted">Chargement...</div>
          ) : (
            <>
              {folderNames.map((folder, idx) => {
                const color = PALETTE[idx % PALETTE.length];
                const isOpen = openFolders.has(folder);
                return (
                  <div key={folder}>
                    <button
                      onClick={() => toggleFolder(folder)}
                      className="w-full flex items-center gap-1.5 px-3 py-1.5 text-left transition-colors duration-150 hover:bg-white/5 cursor-pointer"
                    >
                      <span className="font-mono text-xs" style={{ color }}>{isOpen ? '▾' : '▸'}</span>
                      <span className="font-mono text-xs" style={{ color }}>{folder}/</span>
                    </button>

                    {isOpen && grouped[folder].map(f => {
                      const isSelected = selected === f.path;
                      return (
                        <button
                          key={f.path}
                          onClick={() => selectFile(f.path)}
                          className="w-full flex items-center gap-1.5 px-4 py-1 text-left transition-colors duration-150 cursor-pointer"
                          style={{
                            background: isSelected ? color + '18' : 'transparent',
                            borderLeft: isSelected ? `2px solid ${color}` : '2px solid transparent',
                          }}
                        >
                          <span
                            className="font-mono text-xs truncate"
                            style={{ color: isSelected ? color : 'var(--color-text-muted)' }}
                          >
                            {getFilename(f.path)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}

              {rootFiles.length > 0 && (
                <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--color-border-base)' }}>
                  {rootFiles.map(f => {
                    const isSelected = selected === f.path;
                    return (
                      <button
                        key={f.path}
                        onClick={() => selectFile(f.path)}
                        className="w-full flex items-center gap-1.5 px-3 py-1.5 text-left transition-colors duration-150 cursor-pointer"
                        style={{
                          background: isSelected ? 'rgba(255,255,255,0.05)' : 'transparent',
                          borderLeft: isSelected ? `2px solid var(--color-text-primary)` : '2px solid transparent',
                        }}
                      >
                        <span
                          className="font-mono text-xs truncate ml-3"
                          style={{ color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
                        >
                          {getFilename(f.path)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex-1 overflow-hidden" style={{ background: '#060A0E' }}>
          {loading ? (
            <div className="flex items-center justify-center h-full gap-2">
              <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
              <span className="font-mono text-xs text-text-muted">Chargement...</span>
            </div>
          ) : content ? (
            <SyntaxHighlighter
              language={currentLanguage}
              style={vscDarkPlus}
              showLineNumbers={true}
              wrapLines={true}
              customStyle={{ 
                margin: 0, 
                padding: '16px 0', 
                background: 'transparent',
                fontSize: '12px',
                fontFamily: '"JetBrains Mono", monospace',
                height: '100%',
                overflowX: 'auto'
              }}
              lineNumberStyle={{ 
                minWidth: '48px',
                paddingRight: '12px', 
                color: 'var(--color-text-muted)', 
                borderRight: '1px solid var(--color-border-base)', 
                marginRight: '16px',
                textAlign: 'right',
                userSelect: 'none',
                display: 'inline-block'
              }}
              lineProps={{ 
                style: { display: 'block', whiteSpace: 'pre' } 
              }}
            >
              {content}
            </SyntaxHighlighter>
          ) : (
             <div className="flex items-center justify-center h-full">
              <span className="font-mono text-xs text-text-muted">
                ← Sélectionne un fichier
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}