import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { categories, references } from './references';
import type { Category, ReferenceEntry } from './reference-schema';

type Filter = 'All' | Category;
type CopyTarget = 'brief' | 'prompt' | 'link' | null;

const pad = (value: number) => String(value).padStart(2, '0');

const qualityDefinitions = {
  canonical: 'Verified original, live capture, or high-resolution unaltered supplied source. Reliable for detailed design analysis.',
  usable: 'Reliable for composition, palette, imagery, and broad hierarchy, but not fine typography or texture.',
  limited: 'Useful for concept, rough composition, and broad color direction only; avoid exact UI or typography inference.',
} as const;

const filterHelp: Partial<Record<Filter, string>> = {
  'Reference Styles': 'Transferable layout, hierarchy, navigation, interaction, and component-system patterns that work across aesthetics.',
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reduced;
}

function ReferenceImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`image-fallback ${className ?? ''}`} role="img" aria-label={alt}>
        <span>Preview unavailable</span>
      </div>
    );
  }

  return <img className={className} src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />;
}

function QualityMarker({ reference }: { reference: ReferenceEntry }) {
  return (
    <span className="quality-marker" title={qualityDefinitions[reference.quality.tier]} aria-label={`${reference.quality.tier} source. ${qualityDefinitions[reference.quality.tier]}`}>
      <span className={`quality-dot quality-${reference.quality.tier}`} aria-hidden="true" />
      {reference.quality.tier} source
    </span>
  );
}

function ReferenceCard({ reference, onOpen }: { reference: ReferenceEntry; onOpen: (reference: ReferenceEntry, trigger: HTMLButtonElement) => void }) {
  return (
    <article className="reference-card">
      <button className="card-button" type="button" aria-haspopup="dialog" aria-label={`Open ${reference.title} reference details`} onClick={(event) => onOpen(reference, event.currentTarget)}>
        <div className="card-media">
          <ReferenceImage src={reference.media.poster} alt={`${reference.title} website reference`} />
        </div>
        <div className="card-copy">
          <div className="card-heading">
            <h2>{reference.title}</h2>
            <div className="card-meta">
              <p className="descriptor">{reference.styleDescriptor}</p>
              <QualityMarker reference={reference} />
            </div>
          </div>
          <div className="tags" aria-label="Visual tags">
            {reference.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </div>
        <div className="card-footer">
          <span className="card-category"><i aria-hidden="true" />{reference.primaryCategory}</span>
          <span>{pad(reference.order)} / {references.length}</span>
        </div>
      </button>
    </article>
  );
}

function DetailModal({ reference, onClose }: { reference: ReferenceEntry; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [copyTarget, setCopyTarget] = useState<CopyTarget>(null);
  const reducedMotion = useReducedMotion();
  const hasVerifiedWebsite = reference.source.kind === 'website' && Boolean(reference.source.url);

  useEffect(() => { dialogRef.current?.focus(); }, []);

  const copyText = async (text: string, target: Exclude<CopyTarget, null>) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    }
    setCopyTarget(target);
    window.setTimeout(() => setCopyTarget(null), 1500);
  };

  const handleKeys = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab' || !dialogRef.current) return;
    const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], video[controls], [tabindex]:not([tabindex="-1"])'));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialogRef} className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title" aria-describedby="detail-description" tabIndex={-1} onKeyDown={handleKeys}>
        <div className="detail-visual">
          {reference.media.motionClip && !reducedMotion ? (
            <video src={reference.media.motionClip} poster={reference.media.detailImage} autoPlay muted loop playsInline controls aria-label={`${reference.title} motion reference`} />
          ) : <ReferenceImage src={reference.media.detailImage} alt={`${reference.title} full reference`} />}
        </div>

        <div className="detail-content">
          <div className="detail-heading">
            <div>
              <p className="detail-index">Reference {pad(reference.order)} / {references.length}</p>
              <h2 id="detail-title">{reference.title}</h2>
            </div>
            <p className="detail-kicker">{reference.styleDescriptor}</p>
          </div>
          <p id="detail-description" className="detail-description">{reference.description}</p>
          <div className="tags detail-tags" aria-label="Complete visual tags">
            {reference.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>

          <section className="recipe-panel" aria-label="Image recipe">
            <div className="recipe-label">IMAGE RECIPE — fill [SUBJECT], send to Higgsfield gpt_image_2 @ 2K</div>
            <p>{reference.imagePrompt}</p>
          </section>

          <section className="extension-panel brief-panel" aria-labelledby="brief-heading">
            <div className="extension-label"><span id="brief-heading">Structured AI design brief</span><span>Reference extension</span></div>
            <pre>{reference.brief}</pre>
          </section>

          <div className="extension-grid">
            <section className="extension-panel source-panel" aria-labelledby="source-heading">
              <div className="extension-label"><span id="source-heading">Source &amp; quality</span><QualityMarker reference={reference} /></div>
              <dl>
                <div><dt>Capture</dt><dd>{reference.source.captureMethod.replaceAll('-', ' ')}</dd></div>
                <div><dt>Dimensions</dt><dd>{reference.quality.width} × {reference.quality.height}</dd></div>
                <div><dt>Confidence</dt><dd>{Math.round(reference.quality.confidence * 100)}%</dd></div>
                <div><dt>Reliable for</dt><dd>{reference.quality.reliableFor.join(', ')}</dd></div>
              </dl>
              <p>{reference.quality.note}</p>
              <p className="provenance">Source group: {reference.source.sourceGroupId}{reference.source.capturedAt ? ` · Captured ${reference.source.capturedAt}` : ''}<br />Original preserved at {reference.source.originalAsset}</p>
              {hasVerifiedWebsite && (
                <div className="website-actions">
                  <a href={reference.source.url} target="_blank" rel="noreferrer">Open Website ↗</a>
                  <button type="button" onClick={() => copyText(reference.source.url!, 'link')}>{copyTarget === 'link' ? 'Link copied ✓' : 'Copy Link'}</button>
                </div>
              )}
            </section>

            <section className="extension-panel motion-panel" aria-labelledby="motion-heading">
              <div className="extension-label"><span id="motion-heading">Motion behavior</span><span>{reference.media.motionClip ? 'Loop available' : 'Analysis notes'}</span></div>
              <p>{reference.media.motionNotes ?? 'No defining motion was captured. Treat the composition as a still reference and keep any implementation motion restrained.'}</p>
            </section>
          </div>

          <div className="modal-actions">
            <button type="button" className="action-primary" onClick={() => copyText(reference.brief, 'brief')}>{copyTarget === 'brief' ? 'Brief copied ✓' : 'Copy Brief'}</button>
            <button type="button" className="action-primary" onClick={() => copyText(reference.imagePrompt, 'prompt')}>{copyTarget === 'prompt' ? 'Prompt copied ✓' : 'Copy Image Prompt'}</button>
            <button type="button" className="action-secondary close-action" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [selected, setSelected] = useState<ReferenceEntry | null>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const counts = useMemo(() => {
    const result = new Map<Filter, number>();
    result.set('All', references.length);
    for (const category of categories.slice(1) as Category[]) {
      result.set(category, references.filter((reference) => reference.filters.includes(category)).length);
    }
    return result;
  }, []);
  const visibleReferences = useMemo(
    () => activeFilter === 'All' ? references : references.filter((reference) => reference.filters.includes(activeFilter)),
    [activeFilter],
  );

  useEffect(() => {
    if (!selected) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, [selected]);

  const openReference = (reference: ReferenceEntry, trigger: HTMLButtonElement) => {
    lastTrigger.current = trigger;
    setSelected(reference);
  };
  const closeReference = () => {
    setSelected(null);
    window.setTimeout(() => lastTrigger.current?.focus(), 0);
  };

  return (
    <>
      <main className="library-shell">
        <nav className="filters" aria-label="Reference categories">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={activeFilter === category ? 'active' : ''}
              aria-pressed={activeFilter === category}
              title={filterHelp[category]}
              onClick={() => setActiveFilter(category)}
            >
              <span>{category === 'All' ? 'All references' : category}</span>
              <sup>/{counts.get(category)}</sup>
            </button>
          ))}
        </nav>

        <section className="reference-grid" aria-live="polite" aria-label={`${activeFilter} references`}>
          {visibleReferences.map((reference) => <ReferenceCard key={reference.id} reference={reference} onOpen={openReference} />)}
        </section>

        <footer className="site-footer">
          <span>Local-first / browse-only</span>
          <span>Canonical › usable › limited</span>
          <span>{visibleReferences.length} shown / {references.length} moments</span>
        </footer>
      </main>
      {selected && <DetailModal reference={selected} onClose={closeReference} />}
    </>
  );
}
