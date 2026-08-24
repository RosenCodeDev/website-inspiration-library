import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { categories, references } from './references';
import type { Category, ReferenceEntry } from './reference-schema';
import { categoryProfiles } from './workflow-intelligence';
import { buildAgentPacket, buildBriefCopy, buildImagePromptCopy } from './agent-packet';
import { optimizeCardTagOrder } from './card-tag-layout';

type Filter = 'All' | Category;
type CopyTarget = 'packet' | 'brief' | 'prompt' | 'link' | null;

const pad = (value: number) => String(value).padStart(2, '0');

const formatDescriptor = (descriptor: string) => descriptor.replace(/\s*\/\s*/g, ' × ');

const formatSummary = (reference: ReferenceEntry) => reference.description;

const displayTitle = (reference: ReferenceEntry) => (
  reference.source.siteName
  ?? reference.title.split(' — ')[0].replace(/ Portal$/, '')
);

const qualityDefinitions = {
  canonical: 'Verified original, live capture, or high-resolution unaltered supplied source. Reliable for detailed design analysis.',
  usable: 'Reliable for composition, palette, imagery, and broad hierarchy, but not fine typography or texture.',
  limited: 'Useful for concept, rough composition, and broad color direction only; avoid exact UI or typography inference.',
} as const;

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

function CardQualityDot({ reference }: { reference: ReferenceEntry }) {
  const label = `${reference.quality.tier} source. ${qualityDefinitions[reference.quality.tier]}`;
  return (
    <span className="card-quality-dot" title={label} aria-label={label}>
      <span className={`quality-dot quality-${reference.quality.tier}`} aria-hidden="true" />
    </span>
  );
}

function HoverMotionPreview({
  reference,
  imageSrc,
  imageAlt,
  className,
  active,
  reducedMotion,
  onActivate,
  onDeactivate,
  showQuality = false,
  deferInitialActivation = false,
}: {
  reference: ReferenceEntry;
  imageSrc: string;
  imageAlt: string;
  className: string;
  active: boolean;
  reducedMotion: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  showQuality?: boolean;
  deferInitialActivation?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const deactivateRef = useRef(onDeactivate);
  const [videoFailed, setVideoFailed] = useState(false);
  const [frameReady, setFrameReady] = useState(false);
  const [mediaNearby, setMediaNearby] = useState(deferInitialActivation);
  const [activationReady, setActivationReady] = useState(!deferInitialActivation);
  const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const canPreview = Boolean(reference.media.motionClip) && hoverCapable && !reducedMotion && !videoFailed;

  useEffect(() => { deactivateRef.current = onDeactivate; }, [onDeactivate]);

  useEffect(() => {
    if (!deferInitialActivation) return;
    const timer = window.setTimeout(() => setActivationReady(true), 300);
    return () => window.clearTimeout(timer);
  }, [deferInitialActivation]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !canPreview) return;
    if (deferInitialActivation) {
      setMediaNearby(true);
      return;
    }
    if (!('IntersectionObserver' in window)) {
      setMediaNearby(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setMediaNearby(entry.isIntersecting),
      { rootMargin: '240px 0px' },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [canPreview, deferInitialActivation]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!active || !canPreview) {
      video.pause();
      video.currentTime = 0;
      setFrameReady(false);
      return;
    }

    video.currentTime = 0;
    void video.play().catch(() => {
      setVideoFailed(true);
      deactivateRef.current();
    });
  }, [active, canPreview]);

  return (
    <div
      ref={containerRef}
      className={`${className}${active && canPreview ? ' is-playing' : ''}${frameReady ? ' is-frame-ready' : ''}`}
      onMouseEnter={() => {
        if (canPreview && activationReady) {
          setMediaNearby(true);
          onActivate();
        }
      }}
      onMouseMove={() => {
        if (canPreview && activationReady && !active) {
          setMediaNearby(true);
          onActivate();
        }
      }}
      onMouseLeave={() => {
        if (active) onDeactivate();
      }}
    >
      <ReferenceImage src={imageSrc} alt={imageAlt} />
      {canPreview && mediaNearby && (
        <video
          ref={videoRef}
          className="motion-preview-video"
          src={reference.media.motionClip}
          muted
          loop
          playsInline
          preload="auto"
          aria-label={`${reference.title} motion preview`}
          onPlaying={() => setFrameReady(true)}
          onError={() => {
            setVideoFailed(true);
            onDeactivate();
          }}
        />
      )}
      {showQuality && <CardQualityDot reference={reference} />}
    </div>
  );
}

function CardPreview({
  reference,
  active,
  reducedMotion,
  onActivate,
  onDeactivate,
}: {
  reference: ReferenceEntry;
  active: boolean;
  reducedMotion: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  return (
    <HoverMotionPreview
      reference={reference}
      imageSrc={reference.media.poster}
      imageAlt={`${reference.title} website reference`}
      className="card-media"
      active={active}
      reducedMotion={reducedMotion}
      onActivate={onActivate}
      onDeactivate={onDeactivate}
      showQuality
    />
  );
}

function OptimizedCardTags({ tags }: { tags: string[] }) {
  const visibleTags = useMemo(() => tags.slice(0, 4), [tags]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState(() => visibleTags.map((_, index) => index));

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateOrder = () => {
      const widths = visibleTags.map((_, index) => (
        container.querySelector<HTMLElement>(`[data-tag-index="${index}"]`)?.offsetWidth ?? 0
      ));
      const nextOrder = optimizeCardTagOrder(widths, container.clientWidth);
      setOrder((currentOrder) => (
        currentOrder.every((value, index) => value === nextOrder[index]) ? currentOrder : nextOrder
      ));
    };

    updateOrder();
    const observer = new ResizeObserver(updateOrder);
    observer.observe(container);
    return () => observer.disconnect();
  }, [visibleTags]);

  return (
    <div ref={containerRef} className="tags" aria-label="Visual tags">
      {order.map((index) => (
        <span key={`${visibleTags[index]}-${index}`} data-tag-index={index}>{visibleTags[index]}</span>
      ))}
    </div>
  );
}

const categoryProfileFields = [
  ['composition', 'Composition'],
  ['typography', 'Typography'],
  ['palette', 'Palette'],
  ['texture', 'Texture'],
  ['motion', 'Motion'],
  ['codeHero', 'Code hero'],
  ['avoid', 'Avoid'],
] as const;

function CategoryProfileBar({ activeFilter }: { activeFilter: Filter }) {
  const [open, setOpen] = useState(false);

  if (activeFilter === 'All') {
    return (
      <div className="category-profile-bar category-profile-summary" aria-label="Library summary">
        <span className="category-profile-name">All</span>
        <span className="category-profile-thesis">{categories.length - 1} aesthetic categories. {references.length} reference moments.</span>
      </div>
    );
  }

  const profile = categoryProfiles[activeFilter];
  const detailsId = `category-profile-${activeFilter.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`;

  return (
    <section className={`category-profile-bar${open ? ' is-open' : ''}`} aria-label={`${activeFilter} design profile`}>
      <button
        className="category-profile-toggle"
        type="button"
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="category-profile-name">{activeFilter}</span>
        <span className="category-profile-thesis">{profile.thesis}</span>
        <span className="category-profile-action">
          {open ? 'Hide profile' : 'Show profile'}
          <i aria-hidden="true" />
        </span>
      </button>
      {open && (
        <dl id={detailsId} className="category-profile-details">
          {categoryProfileFields.map(([key, label]) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd>{profile[key]}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

function CategoryProfileVisibilityToggle({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="category-profile-visibility">
      <button
        className={`category-profile-visibility-toggle${visible ? ' is-on' : ''}`}
        type="button"
        aria-pressed={visible}
        onClick={onToggle}
      >
        <span className="category-profile-visibility-check" aria-hidden="true" />
        <span>Show category profile</span>
      </button>
    </div>
  );
}

function ReferenceCard({
  reference,
  onOpen,
  activePreviewId,
  reducedMotion,
  onPreviewChange,
}: {
  reference: ReferenceEntry;
  onOpen: (reference: ReferenceEntry, trigger: HTMLButtonElement) => void;
  activePreviewId: string | null;
  reducedMotion: boolean;
  onPreviewChange: (id: string | null) => void;
}) {
  return (
    <article className="reference-card">
      <button className="card-button" type="button" aria-haspopup="dialog" aria-label={`Open ${reference.title} reference details`} onClick={(event) => onOpen(reference, event.currentTarget)}>
        <CardPreview
          reference={reference}
          active={activePreviewId === reference.id}
          reducedMotion={reducedMotion}
          onActivate={() => onPreviewChange(reference.id)}
          onDeactivate={() => onPreviewChange(null)}
        />
        <div className="card-copy">
          <div className="card-heading">
            <h2>{displayTitle(reference)}</h2>
            <p className="descriptor" title={formatDescriptor(reference.styleDescriptor)}>{reference.cardDescriptor}</p>
          </div>
          <OptimizedCardTags tags={reference.tags} />
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
  const [motionActive, setMotionActive] = useState(false);
  const reducedMotion = useReducedMotion();
  const hasVerifiedWebsite = reference.source.kind === 'website' && Boolean(reference.source.url);
  const imagePrompt = buildImagePromptCopy(reference);
  const recipeText = reference.imageRecipe.kind === 'none' ? reference.imageRecipe.reason : reference.imageRecipe.prompt;
  const recipeType = reference.imageRecipe.kind === 'primary'
    ? 'Primary visual'
    : reference.imageRecipe.kind === 'supporting'
      ? 'Supporting visual'
      : 'Build in code';
  const recipeHeading = reference.imageRecipe.kind === 'none'
    ? 'IMAGE RECIPE — generation not recommended'
    : reference.imageRecipe.kind === 'primary'
      ? 'IMAGE RECIPE — customize [SUBJECT], send to Higgsfield or another image-generation model @ 2K'
      : 'IMAGE RECIPE — generate as a compositing layer with Higgsfield or another image-generation model @ 2K';

  useEffect(() => { dialogRef.current?.focus({ preventScroll: true }); }, []);

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
    const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'));
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
        <HoverMotionPreview
          reference={reference}
          imageSrc={reference.media.detailImage}
          imageAlt={`${reference.title} full reference`}
          className="detail-visual"
          active={motionActive}
          reducedMotion={reducedMotion}
          onActivate={() => setMotionActive(true)}
          onDeactivate={() => setMotionActive(false)}
          deferInitialActivation
        />

        <div className="detail-content">
          <div className="detail-heading">
            <div>
              <p className="detail-index">Reference {pad(reference.order)} of {references.length}</p>
              <h2 id="detail-title">{displayTitle(reference)}</h2>
            </div>
            <p className="detail-kicker">{formatDescriptor(reference.styleDescriptor)}</p>
          </div>
          <p id="detail-description" className="detail-description">{formatSummary(reference)}</p>
          <div className="tags detail-tags" aria-label="Complete visual tags">
            {reference.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>

          <section className="recipe-panel" aria-label="Image recipe">
            <div className="recipe-label">
              <span>{recipeHeading}</span>
              <span>{recipeType}</span>
            </div>
            <p>{recipeText}</p>
          </section>

          <section className="extension-panel brief-panel" aria-labelledby="brief-heading">
            <div className="extension-label"><span id="brief-heading">Structured AI design brief</span></div>
            <pre>{reference.brief}</pre>
          </section>

          <div className="extension-grid">
            <section className="extension-panel source-panel" aria-labelledby="source-heading">
              <div className="extension-label"><span id="source-heading">Source &amp; quality</span></div>
              <dl>
                <div><dt>Capture</dt><dd>{reference.source.captureMethod.replaceAll('-', ' ')}</dd></div>
                <div><dt>Status</dt><dd title={qualityDefinitions[reference.quality.tier]}>{reference.quality.tier} source</dd></div>
                <div><dt>Page type</dt><dd>{reference.workflow.momentType.replaceAll('-', ' ')}</dd></div>
                <div><dt>Dimensions</dt><dd>{reference.quality.width} × {reference.quality.height}</dd></div>
                <div><dt>Confidence</dt><dd>{Math.round(reference.quality.confidence * 100)}%</dd></div>
                <div><dt>Reliable for</dt><dd>{reference.quality.reliableFor.join(', ')}</dd></div>
              </dl>
              <p className="provenance">Source group: {reference.source.sourceGroupId}</p>
              {hasVerifiedWebsite && (
                <div className="website-actions">
                  <a href={reference.source.url} target="_blank" rel="noreferrer">Open Website ↗</a>
                  <button type="button" onClick={() => copyText(reference.source.url!, 'link')}>{copyTarget === 'link' ? 'Link copied ✓' : 'Copy Link'}</button>
                </div>
              )}
            </section>

            <section className="extension-panel motion-panel" aria-labelledby="motion-heading">
              <div className="extension-label">
                <span id="motion-heading">Motion behavior</span>
                {reference.media.motionClip && <span>Loop available</span>}
              </div>
              <p>{reference.media.motionNotes}</p>
            </section>
          </div>

          <div className="modal-actions">
            <button type="button" className="action-primary packet-action" onClick={() => copyText(buildAgentPacket(reference), 'packet')}>{copyTarget === 'packet' ? 'Agent packet copied ✓' : 'Copy Agent Packet'}</button>
            <button type="button" className="action-secondary" onClick={() => copyText(buildBriefCopy(reference), 'brief')}>{copyTarget === 'brief' ? 'Brief copied ✓' : 'Copy Brief'}</button>
            {imagePrompt && (
              <button type="button" className="action-secondary" onClick={() => copyText(imagePrompt, 'prompt')}>{copyTarget === 'prompt' ? 'Prompt copied ✓' : 'Copy Image Prompt'}</button>
            )}
            <button type="button" className="action-secondary close-action" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [categoryProfileVisible, setCategoryProfileVisible] = useState(true);
  const [selected, setSelected] = useState<ReferenceEntry | null>(null);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
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
    setActivePreviewId(null);
    lastTrigger.current = trigger;
    setSelected(reference);
  };
  const closeReference = () => {
    setSelected(null);
    window.setTimeout(() => lastTrigger.current?.focus(), 0);
  };

  return (
    <>
      <main className="library-shell" inert={selected ? true : undefined} aria-hidden={selected ? true : undefined}>
        <nav className="filters" aria-label="Reference categories">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={activeFilter === category ? 'active' : ''}
              aria-pressed={activeFilter === category}
              onClick={() => setActiveFilter(category)}
            >
              <span>{category}</span>
              <sup>{counts.get(category)}</sup>
            </button>
          ))}
        </nav>

        <CategoryProfileVisibilityToggle
          visible={categoryProfileVisible}
          onToggle={() => setCategoryProfileVisible((current) => !current)}
        />
        {categoryProfileVisible && <CategoryProfileBar key={activeFilter} activeFilter={activeFilter} />}

        <p className="filter-status" role="status" aria-live="polite">
          {visibleReferences.length} {activeFilter === 'All' ? 'total' : activeFilter} references shown.
        </p>
        <section className="reference-grid" aria-label={`${activeFilter} references`}>
          {visibleReferences.map((reference) => (
            <ReferenceCard
              key={reference.id}
              reference={reference}
              onOpen={openReference}
              activePreviewId={activePreviewId}
              reducedMotion={reducedMotion}
              onPreviewChange={setActivePreviewId}
            />
          ))}
        </section>

        <footer className="site-footer">
          <span>Haim&apos;s Inspiration Library</span>
          <span>Canonical › usable › limited</span>
          <span>{visibleReferences.length} shown / {references.length} moments</span>
        </footer>
      </main>
      {selected && <DetailModal reference={selected} onClose={closeReference} />}
    </>
  );
}
