import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faImage } from '@fortawesome/free-solid-svg-icons';

interface Props {
  projectKey: string;
  base?: string;
  count?: number;
}

export default function ScreenshotGallery({ projectKey, base = '', count = 0 }: Props) {
  const [current, setCurrent] = useState(0);
  const [imgError, setImgError] = useState(false);

  const total   = count;
  const hasPrev = current > 0;
  const hasNext = current < total - 1;
  const imgSrc  = `${base}/screenshots/${projectKey}/${current + 1}.png`;

  if (total === 0 || imgError) {
    return (
      <div
        className="w-full aspect-video rounded-xl border flex flex-col items-center justify-center gap-3"
        style={{ background: 'var(--color-bg-deep)', borderColor: 'var(--color-border-base)' }}
      >
        <span className="text-text-muted opacity-40 text-4xl">
          <FontAwesomeIcon icon={faImage} />
        </span>
        <p className="font-mono text-xs text-text-muted text-center px-4">
          Screenshots à venir
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full aspect-video rounded-xl overflow-hidden"
           style={{ background: 'var(--color-bg-deep)' }}>
        <img
          src={imgSrc}
          alt={`${projectKey} screenshot ${current + 1}`}
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />

        {hasPrev && (
          <button
            onClick={() => setCurrent(c => c - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150 cursor-pointer"
            style={{ background: 'rgba(6,10,14,0.7)', color: 'var(--color-text-primary)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        )}

        {hasNext && (
          <button
            onClick={() => setCurrent(c => c + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150 cursor-pointer"
            style={{ background: 'rgba(6,10,14,0.7)', color: 'var(--color-text-primary)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        )}

        <span
          className="absolute bottom-2 right-3 font-mono text-xs px-2 py-0.5 rounded"
          style={{ background: 'rgba(6,10,14,0.7)', color: 'var(--color-text-muted)' }}
        >
          {current + 1} / {total}
        </span>
      </div>

      {total > 1 && (
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all duration-200 cursor-pointer"
              style={{
                width:      i === current ? '16px' : '6px',
                height:     '6px',
                background: i === current ? 'var(--color-accent)' : 'var(--color-border-base)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}