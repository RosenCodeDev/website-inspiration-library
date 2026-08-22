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
    return <div className={`image-fallback ${className ?? ''}`} role="img" aria-label={alt}><span>Preview unavailable</span></div>;
  }
  return <img className={className} src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />;
}

function ReferenceCard({ reference, onOpen }: { reference: ReferenceEntry; onOpen: (reference: ReferenceEntry, trigger: HTMLButtonElement) => void }) {
  return (
    <article className="reference-card">
      <button className="card-button" type="button" aria-haspopup="dialog" aria-label={`Open ${reference.title} reference details`} onClick={(event) => onOpen(reference, event.currentTarget)}>
        <div className="card-media">
          <ReferenceImage src={reference.media.poster} alt={`${reference.title} website reference`} />
          <span className={`quality-dot quality-${reference.quality.tier}`} aria-hidden="true" />
        </div>
        <div className="card-copy">
          <p className="descriptor">{reference.styleDescriptor}</p>
          <h2>{reference.title}</h2>
          <div className="tags" aria-label="Visual tags">
            {reference.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </div>
        <div className="card-footer"><span>{reference.primaryCategory}</span><span>{pad(reference.order)} / {references.length}</span></div>
      </button>
    </article>
  );
}

function DetailModal({ reference, onClose }: { reference: ReferenceEntry; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [copyTarget, setCopyTarget] = useState<CopyTarget>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => { closeRef.current?.focus(); }, []);

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
    if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
    if (event.key !== 'Tab' || !dialogRef.current) return;
    const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], video[controls], [tabindex]:not([tabindex="-1"])'));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialogRef} className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title" aria-describedby="detail-description" onKeyDown={handleKeys}>
        <div className="modal-topline">
          <span>Reference {pad(reference.order)} / {references.length}</span><span>{reference.primaryCategory}</span>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close reference details">Close ×</button>
        </div>
        <div className="detail-layout">
          <div className="detail-visual">
            {reference.media.motionClip && !reducedMotion ? (
              <video src={reference.media.motionClip} poster={reference.media.detailImage} autoPlay muted loop playsInline controls aria-label={`${reference.title} motion reference`} />
            ) : <ReferenceImage src={reference.media.detailImage} alt={`${reference.title} full reference`} />}
            <div className="visual-caption"><span>{reference.source.captureMethod.replaceAll('-', ' ')}</span><span>{reference.quality.width} × {reference.quality.height}</span></div>
          </div>
          <div className="detail-copy">
            <p className="detail-kicker">{reference.styleDescriptor}</p>
            <h2 id="detail-title">{reference.title}</h2>
            <p id="detail-description" className="detail-description">{reference.description}</p>
            <div className="tags detail-tags" aria-label="Complete visual tags">{reference.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <section className="quality-panel" aria-label="Reference quality">
              <div><span className={`quality-badge quality-${reference.quality.tier}`}>{reference.quality.tier} source</span><span>{Math.round(reference.quality.confidence * 100)}% analysis confidence</span></div>
              <p>{reference.quality.note}</p>
              <p><strong>Reliable for:</strong> {reference.quality.reliableFor.join(', ')}</p>
            </section>
            {reference.media.motionNotes && <section className="motion-note"><span>Motion behavior</span><p>{reference.media.motionNotes}</p></section>}
          </div>
        </div>
        <div className="prompt-grid">
          <section className="prompt-panel"><div className="panel-label"><span>AI design brief</span><span>Structured</span></div><pre>{reference.brief}</pre></section>
          <section className="prompt-panel prompt-panel-warm"><div className="panel-label"><span>Image prompt</span><span>Original concept</span></div><p>{reference.imagePrompt}</p></section>
        </div>
        <div className="modal-actions">
          <button type="button" className="action-primary" onClick={() => copyText(reference.brief, 'brief')}>{copyTarget === 'brief' ? 'Brief copied ✓' : 'Copy Brief'}</button>
          <button type="button" className="action-primary" onClick={() => copyText(reference.imagePrompt, 'prompt')}>{copyTarget === 'prompt' ? 'Prompt copied ✓' : 'Copy Image Prompt'}</button>
          {reference.source.url && <><a className="action-secondary" href={reference.source.url} target="_blank" rel="noreferrer">Open Website ↗</a><button type="button" className="action-secondary" onClick={() => copyText(reference.source.url!, 'link')}>{copyTarget === 'link' ? 'Link copied ✓' : 'Copy Link'}</button></>}
          <button type="button" className="action-secondary close-action" onClick={onClose}>Close</button>
        </div>
        <p className="provenance">Source group: {reference.source.sourceGroupId}{reference.source.capturedAt ? ` · Captured ${reference.source.capturedAt}` : ''}{' · '}Original preserved at {reference.source.originalAsset}</p>
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
    for (const category of categories.slice(1) as Category[]) result.set(category, references.filter((reference) => reference.filters.includes(category)).length);
    return result;
  }, []);
  const visibleReferences = useMemo(() => activeFilter === 'All' ? references : references.filter((reference) => reference.filters.includes(activeFilter)), [activeFilter]);

  useEffect(() => {
    if (!selected) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, [selected]);

  const openReference = (reference: ReferenceEntry, trigger: HTMLButtonElement) => { lastTrigger.current = trigger; setSelected(reference); };
  const closeReference = () => { setSelected(null); window.setTimeout(() => lastTrigger.current?.focus(), 0); };

  return (
    <>
      <main className="library-shell">
        <header className="masthead">
          <p className="eyebrow">Visual research / local archive</p>
          <div className="title-block"><h1>Reference Library</h1><p>{references.length} moments curated for human judgment and AI direction.</p></div>
          <p className="intro">A visual vocabulary for composition, type, texture, motion, and atmosphere—kept stable even as the web changes.</p>
        </header>
        <nav className="filters" aria-label="Reference categories">
          {categories.map((category) => <button key={category} type="button" className={activeFilter === category ? 'active' : ''} aria-pressed={activeFilter === category} onClick={() => setActiveFilter(category)}><span>{category}</span><sup>{counts.get(category)}</sup></button>)}
        </nav>
        <div className="result-line"><span>{activeFilter}</span><span>{visibleReferences.length} reference{visibleReferences.length === 1 ? '' : 's'}</span></div>
        <section className="reference-grid" aria-live="polite" aria-label={`${activeFilter} references`}>
          {visibleReferences.map((reference) => <ReferenceCard key={reference.id} reference={reference} onOpen={openReference} />)}
        </section>
        <footer className="site-footer"><span>Local-first / browse-only</span><span>Originals preserved · derivatives labelled</span><span>{references.length} moments / 8 filters</span></footer>
      </main>
      {selected && <DetailModal reference={selected} onClose={closeReference} />}
    </>
  );
}
