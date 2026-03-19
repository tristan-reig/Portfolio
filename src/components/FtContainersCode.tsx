import { useState, useEffect } from 'react';

const API_URL = 'https://ftcontainers-production.up.railway.app';

interface FileEntry {
  path: string;
  sha: string;
}

const FOLDER_ORDER = ['includes/containers', 'includes/iterators', 'includes/utils', 'srcs', 'tests'];

const FOLDER_LABELS: Record<string, string> = {
  'includes/containers': 'containers/',
  'includes/iterators':  'iterators/',
  'includes/utils':      'utils/',
  'srcs':                'srcs/',
  'tests':               'tests/',
};

const FOLDER_COLORS: Record<string, string> = {
  'includes/containers': '#00FF9C',
  'includes/iterators':  '#61DAFB',
  'includes/utils':      '#FFB830',
  'srcs':                '#D4DFE8',
  'tests':               '#FF4D6A',
};

function getFolder(path: string): string {
  const parts = path.split('/');
  if (parts.length === 1) return 'root';
  if (parts[0] === 'includes') return `includes/${parts[1]}`;
  return parts[0];
}

function getFilename(path: string): string {
  return path.split('/').pop() ?? path;
}

// Minimal C++ syntax highlighter
function highlight(code: string): string {
  const keywords = [
    'template','typename','class','struct','namespace','public','private',
    'protected','explicit','virtual','const','void','bool','return','if',
    'else','while','for','typedef','static','inline','friend','operator',
    'new','delete','this','true','false','NULL','throw','try','catch',
  ];
  const types = [
    'size_t','size_type','difference_type','value_type','allocator_type',
    'reference','const_reference','pointer','const_pointer','iterator',
    'const_iterator','reverse_iterator','const_reverse_iterator',
    'node_type','node_allocator','ptrdiff_t',
  ];

  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, '<span style="color:#FFB830">$&</span>')
    .replace(/(\/\/[^\n]*)/g, '<span style="color:#3A5060;font-style:italic">$1</span>')
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#3A5060;font-style:italic">$1</span>')
    .replace(/(#\w+)/g, '<span style="color:#FF4D6A">$1</span>')
    .replace(
      new RegExp(`\\b(${keywords.join('|')})\\b`, 'g'),
      '<span style="color:#61DAFB">$1</span>'
    )
    .replace(
      new RegExp(`\\b(${types.join('|')})\\b`, 'g'),
      '<span style="color:#B57BFF">$1</span>'
    )
    .replace(/\b(\d+)\b/g, '<span style="color:#FFB830">$1</span>')
    .replace(/\bft::/g, '<span style="color:#00FF9C">ft::</span>');
}

export default function FtContainersCode() {
  const [files, setFiles]           = useState<FileEntry[]>([]);
  const [selected, setSelected]     = useState<string | null>(null);
  const [content, setContent]       = useState<string>('');
  const [loading, setLoading]       = useState(false);
  const [loadingTree, setLoadingTree] = useState(true);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set(['includes/containers']));

  useEffect(() => {
    fetch(`${API_URL}/tree`)
      .then(r => r.json())
      .then((data: FileEntry[]) => {
        setFiles(data);
        setLoadingTree(false);
        if (data.length > 0) {
          const first = data.find(f => f.path.startsWith('includes/containers'));
          if (first) selectFile(first.path);
        }
      })
      .catch(() => setLoadingTree(false));
  }, []);

  const selectFile = (path: string) => {
    setSelected(path);
    setLoading(true);
    setContent('');
    fetch(`${API_URL}/file?path=${encodeURIComponent(path)}`)
      .then(r => r.json())
      .then(data => {
        setContent(data.content);
        setLoading(false);
      })
      .catch(() => {
        setContent('// Erreur de chargement');
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
  files.forEach(f => {
    const folder = getFolder(f.path);
    if (!grouped[folder]) grouped[folder] = [];
    grouped[folder].push(f);
  });

  const lines = content.split('\n');

  return (
    <div
      className="w-full rounded-xl border overflow-hidden flex flex-col"
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
          ft_containers — {selected ? getFilename(selected) : 'select a file'}
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          className="shrink-0 overflow-y-auto border-r"
          style={{
            width: '200px',
            borderColor: 'var(--color-border-base)',
            background: 'rgba(0,0,0,0.3)',
          }}
        >
          {loadingTree ? (
            <div className="p-3 font-mono text-xs text-text-muted">Chargement…</div>
          ) : (
            FOLDER_ORDER.filter(f => grouped[f]).map(folder => {
              const color = FOLDER_COLORS[folder] ?? '#D4DFE8';
              const isOpen = openFolders.has(folder);
              return (
                <div key={folder}>
                  <button
                    onClick={() => toggleFolder(folder)}
                    className="w-full flex items-center gap-1.5 px-3 py-1.5 text-left transition-colors duration-150 hover:bg-white/5"
                  >
                    <span className="font-mono text-xs" style={{ color }}>
                      {isOpen ? '▾' : '▸'}
                    </span>
                    <span className="font-mono text-xs" style={{ color }}>
                      {FOLDER_LABELS[folder] ?? folder}
                    </span>
                  </button>

                  {isOpen && grouped[folder].map(f => {
                    const isSelected = selected === f.path;
                    return (
                      <button
                        key={f.path}
                        onClick={() => selectFile(f.path)}
                        className="w-full flex items-center gap-1.5 px-4 py-1 text-left transition-colors duration-150"
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
            })
          )}
        </div>

        <div
          className="flex-1 overflow-auto"
          style={{ background: '#060A0E' }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full gap-2">
              <div
                className="w-4 h-4 rounded-full border-2 animate-spin"
                style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
              />
              <span className="font-mono text-xs text-text-muted">Chargement…</span>
            </div>
          ) : content ? (
            <table className="w-full border-collapse" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px' }}>
              <tbody>
                {lines.map((line, i) => (
                  <tr
                    key={i}
                    className="hover:bg-white/5 transition-colors duration-75"
                  >
                    <td
                      className="select-none text-right pr-4 pl-3 py-0"
                      style={{
                        color: 'var(--color-text-muted)',
                        minWidth: '40px',
                        borderRight: '1px solid var(--color-border-base)',
                        userSelect: 'none',
                        lineHeight: '1.6',
                      }}
                    >
                      {i + 1}
                    </td>
                    <td
                      className="pl-4 pr-3 py-0 whitespace-pre"
                      style={{ color: '#D4DFE8', lineHeight: '1.6' }}
                      dangerouslySetInnerHTML={{ __html: highlight(line) }}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
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