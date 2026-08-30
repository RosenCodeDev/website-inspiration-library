import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from 'react';
import type { Category, ReferenceEntry } from './reference-schema';
import {
  buildDirectionsPrompt,
  buildHeroImagesPrompt,
  buildTweakBarPrompt,
  buildVariantsPrompt,
  manualPromptStageNames,
  primaryCategoryReferences,
  promptReferenceName,
  type ManualPromptStage,
  type ManualSelectionMode,
} from './manual-prompts';
import {
  buildManualDesignReviewTemplate,
  designReviewTemplateFilename,
} from './design-review-template';

const pad = (value: number) => String(value).padStart(2, '0');

const PromptVisibilityIcon = () => (
  <svg className="category-profile-visibility-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <rect className="category-profile-visibility-icon-frame" width="16" height="16" />
    <rect className="category-profile-visibility-icon-field" x="2" y="2" width="12" height="12" />
    <rect className="category-profile-visibility-icon-center" x="4" y="4" width="8" height="8" />
  </svg>
);

export function ManualPromptVisibilityToggle({
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
        <PromptVisibilityIcon />
        <span>Show manual prompts</span>
      </button>
    </div>
  );
}

export function ManualPromptDock({
  references,
  mode,
  onModeChange,
  onReshuffle,
  onUnselectAll,
  onReview,
  reviewButtonRef,
  inert,
}: {
  references: readonly ReferenceEntry[];
  mode: ManualSelectionMode;
  onModeChange: (mode: ManualSelectionMode) => void;
  onReshuffle: () => void;
  onUnselectAll: () => void;
  onReview: () => void;
  reviewButtonRef: RefObject<HTMLButtonElement | null>;
  inert: boolean;
}) {
  return (
    <section
      className="manual-prompt-dock"
      aria-label="Manual prompt controls"
      inert={inert ? true : undefined}
      aria-hidden={inert ? true : undefined}
    >
      <strong className="manual-prompt-count" aria-live="polite">
        {pad(references.length)} card{references.length === 1 ? '' : 's'} selected
      </strong>
      <div className="manual-prompt-picks">
        {references.slice(0, 4).map((reference) => (
          <span className="manual-prompt-chip" key={reference.id}>
            <strong>{promptReferenceName(reference)}</strong>
            <code>{reference.id}</code>
          </span>
        ))}
        {references.length > 4 && (
          <span className="manual-prompt-chip">
            <strong>More selected</strong>
            <code>view in review</code>
          </span>
        )}
      </div>
      <div className="manual-prompt-mode" role="group" aria-label="Card selection mode">
        {(['random', 'manual'] as const).map((value) => (
          <button
            key={value}
            type="button"
            className={mode === value ? 'is-active' : ''}
            aria-pressed={mode === value}
            onClick={() => onModeChange(value)}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="manual-prompt-actions">
        <button type="button" disabled={mode !== 'random'} onClick={onReshuffle}>Reshuffle</button>
        <button type="button" disabled={references.length === 0} onClick={onUnselectAll}>Unselect all</button>
        <button
          ref={reviewButtonRef}
          className="manual-prompt-primary"
          type="button"
          disabled={references.length === 0}
          onClick={onReview}
        >
          Review prompt
        </button>
      </div>
    </section>
  );
}

const writeClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      const copied = document.execCommand('copy');
      textArea.remove();
      return copied;
    } catch {
      return false;
    }
  }
};

const downloadTextFile = (filename: string, content: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/html;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

export function ManualPromptModal({
  catalog,
  categories,
  selectedReferences,
  onClose,
}: {
  catalog: readonly ReferenceEntry[];
  categories: readonly Category[];
  selectedReferences: readonly ReferenceEntry[];
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [stage, setStage] = useState<ManualPromptStage>(1);
  const [winningId, setWinningId] = useState(selectedReferences[0]?.id ?? '');
  const [versionLabel, setVersionLabel] = useState('');
  const [variantLabel, setVariantLabel] = useState('');
  const [heroCategory, setHeroCategory] = useState<Category>(selectedReferences[0]?.primaryCategory ?? categories[0]);
  const [heroAnchorId, setHeroAnchorId] = useState('');
  const [extraHeroIds, setExtraHeroIds] = useState<Set<string>>(new Set());
  const [copyStatus, setCopyStatus] = useState('');

  const winningReference = selectedReferences.find((reference) => reference.id === winningId) ?? selectedReferences[0] ?? null;
  const categoryReferences = useMemo(
    () => primaryCategoryReferences(catalog, heroCategory),
    [catalog, heroCategory],
  );
  const heroAnchor = catalog.find((reference) => reference.id === heroAnchorId) ?? null;
  const availableAdditionalReferences = categoryReferences.filter((reference) => reference.id !== heroAnchorId);
  const additionalReferences = categoryReferences.filter((reference) => extraHeroIds.has(reference.id));
  const prompt = stage === 1
    ? buildDirectionsPrompt(selectedReferences)
    : stage === 2
      ? buildVariantsPrompt(winningReference, versionLabel)
      : stage === 3
        ? buildHeroImagesPrompt({ variantLabel, anchor: heroAnchor, additionalReferences })
        : buildTweakBarPrompt(variantLabel);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, []);

  useEffect(() => {
    setCopyStatus('');
  }, [stage, prompt]);

  const changeWinningReference = (id: string) => {
    setWinningId(id);
    const reference = selectedReferences.find((entry) => entry.id === id);
    if (reference) setHeroCategory(reference.primaryCategory);
    setHeroAnchorId('');
    setExtraHeroIds(new Set());
  };

  const changeHeroCategory = (category: Category) => {
    setHeroCategory(category);
    setHeroAnchorId('');
    setExtraHeroIds(new Set());
  };

  const changeHeroAnchor = (id: string) => {
    setHeroAnchorId(id);
    setExtraHeroIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  };

  const toggleAdditionalReference = (id: string) => {
    setExtraHeroIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyPrompt = async () => {
    const copied = await writeClipboard(prompt);
    setCopyStatus(copied ? 'Copied' : 'Copy failed');
    window.setTimeout(() => setCopyStatus(''), 1500);
  };

  const downloadDesignReviewTemplate = () => {
    downloadTextFile(
      designReviewTemplateFilename,
      buildManualDesignReviewTemplate(selectedReferences.length),
    );
    setCopyStatus('Template downloaded');
    window.setTimeout(() => setCopyStatus(''), 1500);
  };

  const handleKeys = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab' || !dialogRef.current) return;
    const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), select:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )).filter((element) => element.getClientRects().length > 0);
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
    <div className="manual-prompt-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div
        ref={dialogRef}
        className="manual-prompt-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-prompts-title"
        tabIndex={-1}
        onKeyDown={handleKeys}
      >
        <header className="manual-prompt-dialog-head">
          <div>
            <h2 id="manual-prompts-title">Manual prompts</h2>
            <p>MULTI-CARD, CONTEXT-SHARED — NOT SEALED</p>
          </div>
          <button ref={closeRef} className="manual-prompt-close" type="button" aria-label="Close manual prompts" onClick={onClose}>
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <div className="manual-prompt-dialog-layout">
          <nav className="manual-prompt-stage-nav" aria-label="Prompt workflow">
            <strong>Prompt workflow</strong>
            {manualPromptStageNames.map((name, index) => {
              const value = (index + 1) as ManualPromptStage;
              return (
                <button
                  key={name}
                  type="button"
                  className={stage === value ? 'is-current' : ''}
                  aria-current={stage === value ? 'step' : undefined}
                  onClick={() => setStage(value)}
                >
                  <span>Prompt {value} of 4</span>
                  {name}
                </button>
              );
            })}
          </nav>
          <section className="manual-prompt-workspace">
            {stage === 2 && (
              <div className="manual-prompt-config">
                <label>
                  <span>Winning direction</span>
                  <select value={winningReference?.id ?? ''} onChange={(event) => changeWinningReference(event.target.value)}>
                    {selectedReferences.map((reference) => (
                      <option key={reference.id} value={reference.id}>{promptReferenceName(reference)}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Version label from Prompt 1</span>
                  <input value={versionLabel} placeholder="[version number placeholder]" onChange={(event) => setVersionLabel(event.target.value)} />
                </label>
              </div>
            )}
            {stage === 3 && (
              <div className="manual-prompt-config">
                <label>
                  <span>Chosen variant</span>
                  <input value={variantLabel} placeholder="[version number placeholder]" onChange={(event) => setVariantLabel(event.target.value)} />
                </label>
                <label>
                  <span>Reference category</span>
                  <select value={heroCategory} onChange={(event) => changeHeroCategory(event.target.value as Category)}>
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </label>
                <label className="manual-prompt-wide-field">
                  <span>Chosen Variant Reference Image</span>
                  <select value={heroAnchorId} onChange={(event) => changeHeroAnchor(event.target.value)}>
                    <option value="">[chosen variant reference image placeholder]</option>
                    {categoryReferences.map((reference) => (
                      <option key={reference.id} value={reference.id}>{promptReferenceName(reference)}</option>
                    ))}
                  </select>
                </label>
                <fieldset className="manual-prompt-reference-fieldset">
                  <legend>Explicit additional references</legend>
                  <div className="manual-prompt-reference-picker">
                    {availableAdditionalReferences.map((reference) => (
                      <label className="manual-prompt-reference-option" key={reference.id}>
                        <input
                          type="checkbox"
                          checked={extraHeroIds.has(reference.id)}
                          onChange={() => toggleAdditionalReference(reference.id)}
                        />
                        <span>{promptReferenceName(reference)}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}
            <div className="manual-prompt-sheet">
              <header>
                <strong>{manualPromptStageNames[stage - 1]}</strong>
                <div>
                  <span className="manual-prompt-copy-status" role="status" aria-live="polite">{copyStatus}</span>
                  {stage === 1 && (
                    <button type="button" onClick={downloadDesignReviewTemplate}>Download design review template</button>
                  )}
                  <button type="button" onClick={copyPrompt}>Copy prompt</button>
                </div>
              </header>
              <pre>{prompt}</pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
