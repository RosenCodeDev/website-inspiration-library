#!/usr/bin/env node
import { existsSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertContainedPath } from './path-safety.mjs';
import { assertSealedPayload, renderVisualPrompt, scanExactSignals, scanSourceIdentity, validatePreviewTree } from './visual-contract.mjs';

const RELEASE_MODEL = 'gpt-5.6-sol';
const DEGRADED_WARNING = 'This generation can see project intake and is not isolated.';
const DEGRADED_ACTION = 'RUN DEGRADED GENERATION';
const SUBSCRIPTION_MODE = 'subscription-ephemeral';
const MAX_STRUCTURED_OUTPUT_BYTES = 2 * 1024 * 1024;
const commandResult = (command, args, options = {}) => spawnSync(command, args, { encoding: 'utf8', timeout: options.timeout ?? 300_000, maxBuffer: 20 * 1024 * 1024, ...options });
const codexExecutable = () => process.env.CODEX_EXECUTABLE ?? (process.platform === 'win32' ? 'codex.exe' : 'codex');
const sanitizedSubscriptionEnv = (source = process.env) => Object.fromEntries(Object.entries(source).filter(([key]) => key.toLowerCase() !== 'openai_api_key'));
const subscriptionCodexArgs = (workspace, stillPaths, schemaPath, resultPath) => [
  'exec', '--ephemeral', '--ignore-user-config', '--ignore-rules', '--sandbox', 'read-only',
  '--skip-git-repo-check', '-C', workspace, '--output-schema', schemaPath, '--output-last-message', resultPath,
  '-i', ...stillPaths,
];
const authMode = (value) => /chatgpt/i.test(String(value ?? '')) ? 'chatgpt' : /api[ -]?key/i.test(String(value ?? '')) ? 'api-key' : 'unknown';
const subscriptionFeatureStatus = (options = {}) => {
  const result = (options.featureRun ?? options.run ?? commandResult)(options.codex ?? codexExecutable(), ['features', 'list'], {
    timeout: options.timeout ?? 30_000, shell: false, env: sanitizedSubscriptionEnv(options.env),
  });
  const detail = `${result.stdout ?? ''}\n${result.stderr ?? ''}`.trim();
  const match = detail.match(/^image_generation\s+\S+\s+(true|false)\s*$/im);
  return { available: result.status === 0 && match?.[1] === 'true', configured: match ? match[1] === 'true' : null, detail };
};
const subscriptionLoginStatus = (options = {}) => {
  const run = options.authRun ?? options.run ?? commandResult; const codex = options.codex ?? codexExecutable();
  const env = sanitizedSubscriptionEnv(options.env); const commandOptions = { timeout: options.timeout ?? 30_000, shell: false, env };
  const doctor = run(codex, ['doctor', '--json'], commandOptions);
  try {
    const report = JSON.parse(doctor.stdout ?? '');
    const credentials = report?.checks?.['auth.credentials']; const mode = authMode(credentials?.details?.['stored auth mode']);
    if (credentials?.status === 'ok' && mode !== 'unknown') {
      return { available: true, authenticatedWith: mode, detail: JSON.stringify(credentials), source: 'doctor', report };
    }
  } catch { /* Older Codex builds may not support machine-readable doctor output. */ }
  const fallback = run(codex, ['login', 'status'], commandOptions);
  const detail = `${fallback.stdout ?? ''}\n${fallback.stderr ?? ''}`.trim();
  return { available: fallback.status === 0, authenticatedWith: authMode(detail), detail, source: 'login-status', report: null };
};
const createSubscriptionWorkspace = async (evidencePath, payload, options = {}) => {
  assertSealedPayload(payload, { requireChecksum: true });
  const workspace = options.workspace ?? await mkdtemp(resolve(tmpdir(), 'design-taste-subscription-'));
  const input = resolve(workspace, 'input'); const output = resolve(workspace, 'output');
  await mkdir(input, { recursive: true }); await mkdir(output, { recursive: true });
  const referenceName = `reference${extname(evidencePath) || '.png'}`; const reference = resolve(input, referenceName);
  await cp(evidencePath, reference);
  const sealed = structuredClone(payload); sealed.reference.stillPath = `input/${referenceName}`;
  const serializedPayload = `${JSON.stringify(sealed, null, 2)}\n`; const prompt = `${renderVisualPrompt(sealed)}\n`;
  await writeFile(resolve(workspace, 'payload.json'), serializedPayload, 'utf8');
  await writeFile(resolve(workspace, 'PROMPT.md'), prompt, 'utf8');
  const schemaPath = resolve(workspace, 'output-schema.json'); const resultPath = resolve(workspace, 'structured-result.json');
  await writeFile(schemaPath, `${JSON.stringify(outputSchema, null, 2)}\n`, 'utf8');
  const referenceBytes = await readFile(reference); const actualStillHash = createHash('sha256').update(referenceBytes).digest('hex');
  if (sealed.reference.sha256 !== actualStillHash) throw new Error('Staged still does not match the sealed payload checksum.');
  const workspaceFingerprint = createHash('sha256').update(serializedPayload).update(prompt).update(referenceBytes).update(JSON.stringify(outputSchema)).digest('hex');
  return { workspace, input, output, reference, payload: sealed, prompt, schemaPath, resultPath, workspaceFingerprint, temporary: !options.workspace };
};
const retryPrompt = (prompt, payload, failure) => {
  const redactions = [...(payload.identityExclusions?.reviewedSignals ?? []), ...(payload.identityExclusions?.exactSignals ?? [])]
    .filter((value) => typeof value === 'string' && value.trim()).sort((left, right) => right.length - left.length);
  const sanitized = redactions.reduce((text, signal) => text.replace(new RegExp(signal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'giu'), '[REDACTED]'), String(failure?.message ?? failure))
    .replace(/(?:file:\/\/|[A-Za-z]:[\\/])\S+/g, '[PATH]').slice(0, 1200);
  return `${prompt}\n\nCORRECTION\nThe previous structured response failed deterministic validation: ${sanitized}\nReturn a complete corrected manifest. Do not discuss the failure.`;
};
const structuredSubscriptionPrompt = (workspace) => {
  const h0Rule = workspace.payload.output?.h0 === 'reserved-image-hole-with-flat-stand-in'
    ? '\nH0 SLOT RULE: Do not render, approximate, trace, or decorate the FUTURE HERO yet. data-future-image-slot must be empty and use one opaque solid background color only: no children, text, image, SVG, canvas, gradient, pattern, border artwork, shadow, filter, backdrop-filter, mask, or ::before/::after content. Put all copy and interface details in sibling elements outside the slot.'
    : '';
  return `${workspace.prompt}\n\nEXECUTION CONTRACT\nInspect the attached still directly. Do not use shell, filesystem, network, or other tools. Return only JSON matching the supplied schema. Put the complete local preview in the files array as UTF-8 text. Use index.html, styles.css, script.js, or local text files under assets/. Do not embed base64 or data-URI assets. Set inspection.stillSha256 to ${workspace.payload.reference.sha256}. Do not write files or create output-contract.json.${h0Rule}`;
};
const runSubscriptionGeneration = async (payload, stillPath, outputRoot, options = {}) => {
  const login = options.loginStatus ?? subscriptionLoginStatus(options);
  if (!login.available) throw new Error('Codex CLI is unavailable or not signed in. Run codex login with ChatGPT subscription access.');
  if (login.authenticatedWith === 'api-key') throw new Error('Subscription generation requires active ChatGPT authentication; active API-key authentication is not allowed.');
  if (login.authenticatedWith !== 'chatgpt') throw new Error(`Codex authentication could not be confirmed as ChatGPT (${login.source ?? 'unknown'}): ${login.detail || 'no diagnostic output'}`);
  const feature = options.featureStatus ?? subscriptionFeatureStatus(options);
  const workspace = await createSubscriptionWorkspace(stillPath, payload, options);
  try {
    const args = subscriptionCodexArgs(workspace.workspace, [workspace.reference], workspace.schemaPath, workspace.resultPath);
    const run = options.generationRun ?? options.run ?? commandResult; let prompt = structuredSubscriptionPrompt(workspace); let lastError;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await rm(workspace.resultPath, { force: true });
      const result = run(options.codex ?? codexExecutable(), args, {
        cwd: workspace.workspace, input: prompt, timeout: options.timeout ?? 600_000, shell: false,
        env: sanitizedSubscriptionEnv(options.env),
      });
      if (result.status !== 0) throw new Error(result.stderr?.trim() || result.stdout?.trim() || 'Subscription-backed Codex generation failed.');
      try {
        if (!existsSync(workspace.resultPath)) throw new Error('Codex completed without returning structured output.');
        const raw = await readFile(workspace.resultPath, 'utf8');
        if (Buffer.byteLength(raw) > MAX_STRUCTURED_OUTPUT_BYTES) throw new Error('Structured output exceeds the 2 MiB limit.');
        let manifest; try { manifest = JSON.parse(raw); } catch { throw new Error('Structured output is not valid JSON.'); }
        await materializeOutput(manifest, workspace.output, workspace.payload.reference.sha256);
        await validatePreviewTree(workspace.output);
        await rm(outputRoot, { recursive: true, force: true }); await mkdir(dirname(outputRoot), { recursive: true }); await cp(workspace.output, outputRoot, { recursive: true });
        const validation = options.validateAttempt ? await options.validateAttempt(outputRoot, { attempt, result, manifest }) : null;
        return {
          mode: SUBSCRIPTION_MODE, isolationMode: SUBSCRIPTION_MODE, isolated: false, contextLimited: true,
          authenticatedWith: 'chatgpt', runner: 'codex-cli', outputMode: 'structured-manifest', attempt: attempt + 1,
          workspaceFingerprint: workspace.workspaceFingerprint, imageGenerationFeature: feature.configured,
          validation, stdout: result.stdout?.trim() ?? '', stderr: result.stderr?.trim() ?? '',
        };
      } catch (error) {
        lastError = error;
        if (attempt === 1) break;
        prompt = retryPrompt(structuredSubscriptionPrompt(workspace), workspace.payload, error);
      }
    }
    throw new Error(`Subscription generation failed after two structured attempts: ${lastError?.message ?? 'validation failed'}`);
  } finally {
    if (workspace.temporary && options.keepWorkspace !== true) await rm(workspace.workspace, { recursive: true, force: true });
  }
};
const outputSchema = {
  type: 'object', additionalProperties: false, required: ['files', 'inspection'],
  properties: {
    files: {
      type: 'array', minItems: 1, maxItems: 20,
      items: { type: 'object', additionalProperties: false, required: ['path', 'content'], properties: { path: { type: 'string', pattern: '^(index\\.html|styles\\.css|script\\.js|assets/[A-Za-z0-9._/-]+\\.(?:html|css|js|json|txt|svg))$' }, content: { type: 'string' } } },
    },
    inspection: { type: 'object', additionalProperties: false, required: ['stillSha256'], properties: { stillSha256: { type: 'string', pattern: '^[a-f0-9]{64}$' } } },
  },
};
const genericInstructions = [
  'You are a sealed visual-direction generator. Use only the supplied sealed payload and attached still.',
  'You have no tools, project context, catalog, sibling directions, motion, or conversation history.',
  'Return strict JSON matching the supplied schema. Do not emit markdown or external references.',
].join(' ');
const mimeFor = (path) => ({ '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' })[extname(path).toLowerCase()] ?? 'application/octet-stream';
const outputText = (response) => {
  if (typeof response?.output_text === 'string') return response.output_text;
  return (response?.output ?? []).flatMap((item) => item?.content ?? []).filter((item) => item?.type === 'output_text').map((item) => item.text).join('');
};
const assertNoPathLeak = (value, paths = []) => {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  for (const path of paths.filter(Boolean)) if (serialized.toLowerCase().includes(String(path).replaceAll('\\', '/').toLowerCase()) || serialized.toLowerCase().includes(String(path).toLowerCase())) throw new Error('Sealed API request contains a protected project or library path.');
  if (/(?:file:\/\/|[A-Za-z]:\\)/i.test(serialized)) throw new Error('Sealed API request contains an absolute filesystem path.');
};
const validateEnvelope = (value, guards = {}) => {
  const intakeMatches = scanExactSignals(value, guards.leakSignals);
  if (intakeMatches.length) throw new Error(`Sealed API envelope contains intake leak signal: ${intakeMatches[0].value}`);
  assertNoPathLeak(value, [guards.projectRoot, guards.libraryRoot]);
  const serialized = JSON.stringify(value);
  for (const forbidden of ['motionClip', 'motionNotes', 'categoryProfile', 'categoryConstitution', 'catalogFingerprint', 'siblingCards', 'rejectedCards']) if (serialized.includes(`"${forbidden}"`)) throw new Error(`Sealed API envelope contains forbidden data: ${forbidden}`);
  return true;
};
const validateIdentityPlacement = (payload, prompt) => {
  const exactSignals = (payload?.identityExclusions?.reviewedSignals ?? []).filter((value) => {
    const normalized = String(value).normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim(); return normalized.includes('.') || normalized.split(/\s+/).filter(Boolean).length >= 2;
  });
  const signalDocument = { signals: exactSignals.map((value) => ({ value, normalized: String(value).normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim() })) };
  const sanitizedPayload = structuredClone(payload);
  if (sanitizedPayload.card) { sanitizedPayload.card.id = ''; sanitizedPayload.card.name = ''; }
  if (sanitizedPayload.identityExclusions) { sanitizedPayload.identityExclusions.exactSignals = []; sanitizedPayload.identityExclusions.derivedSignals = []; sanitizedPayload.identityExclusions.reviewedSignals = []; }
  const payloadMatches = scanExactSignals(sanitizedPayload, signalDocument);
  const promptWithoutAllowedIdentityLines = prompt.split(/\r?\n/).filter((line, index, lines) => {
    const previous = lines[index - 1] ?? '';
    return !line.startsWith('Exclude these curated source identities exactly:') && previous !== 'REFERENCE';
  }).join('\n');
  const promptMatches = scanExactSignals(promptWithoutAllowedIdentityLines, signalDocument);
  if (payloadMatches.length || promptMatches.length) throw new Error(`Sealed API request contains source identity outside curated exclusion metadata: ${(payloadMatches[0] ?? promptMatches[0]).value}`);
};
const buildSealedRequest = async (payload, stillPath, guards = {}) => {
  assertSealedPayload(payload, { requireChecksum: true });
  const bytes = await readFile(stillPath); const prompt = renderVisualPrompt(payload);
  if (payload.reference.sha256 && payload.reference.sha256 !== (await import('node:crypto')).createHash('sha256').update(bytes).digest('hex')) throw new Error('Staged still does not match the sealed payload checksum.');
  const sealedText = JSON.stringify({ prompt, payload });
  validateEnvelope(sealedText, guards);
  validateIdentityPlacement(payload, prompt);
  const request = {
    model: guards.model ?? RELEASE_MODEL, store: false, background: false, stream: false, instructions: genericInstructions,
    input: [{ role: 'user', content: [{ type: 'input_text', text: sealedText }, { type: 'input_image', image_url: `data:${mimeFor(stillPath)};base64,${bytes.toString('base64')}`, detail: 'high' }] }],
    tools: [], tool_choice: 'none', reasoning: { effort: 'high' },
    text: { format: { type: 'json_schema', name: 'inspiration_preview_files', strict: true, schema: outputSchema } },
  };
  validateSealedRequest(request, guards);
  return request;
};
const validateSealedRequest = (request, guards = {}) => {
  const keys = Object.keys(request).sort();
  const expected = ['background', 'input', 'instructions', 'model', 'reasoning', 'store', 'stream', 'text', 'tool_choice', 'tools'].sort();
  if (JSON.stringify(keys) !== JSON.stringify(expected)) throw new Error('Sealed API request contains unexpected top-level fields.');
  if (request.store !== false || request.background !== false || request.stream !== false || request.tool_choice !== 'none' || !Array.isArray(request.tools) || request.tools.length) throw new Error('Sealed API request is not stateless and tool-free.');
  if ('conversation' in request || 'previous_response_id' in request || 'metadata' in request || 'prompt' in request) throw new Error('Sealed API request contains persisted context fields.');
  if (request.reasoning?.effort !== 'high' || request.text?.format?.type !== 'json_schema' || request.text.format.strict !== true) throw new Error('Sealed API request is missing high reasoning or strict structured output.');
  if (!guards.allowDevelopmentModel && request.model !== RELEASE_MODEL) throw new Error(`Release isolation requires ${RELEASE_MODEL}.`);
  if (request.input?.length !== 1 || request.input[0].content?.filter((item) => item.type === 'input_image').length !== 1) throw new Error('Sealed API request requires exactly one still image.');
  validateEnvelope(request, guards);
  return true;
};
const buildRetryRequest = (originalRequest, retry, guards = {}) => {
  if (!retry || !Array.isArray(retry.previousFiles) || !Array.isArray(retry.failures)) throw new Error('Retry requires previous files and machine-validation failures.');
  const correction = { previousFiles: retry.previousFiles, previewScreenshot: retry.previewScreenshot ?? null, machineValidationFailures: retry.failures, instruction: 'Correct only the listed machine-validation failures. Preserve the original sealed visual brief.' };
  validateEnvelope(correction, guards);
  const originalEnvelope = JSON.parse(originalRequest.input[0].content[0].text);
  const identityMatches = guards.sourceIdentity ? scanSourceIdentity(correction, guards.sourceIdentity) : scanExactSignals(correction, {
    signals: (originalEnvelope.payload?.identityExclusions?.exactSignals ?? []).filter((value) => {
      const normalized = String(value).normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim(); return normalized.includes('.') || normalized.split(/\s+/).filter(Boolean).length >= 2;
    }).map((value) => ({ value, normalized: String(value).normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim() })),
  });
  if (identityMatches.length) throw new Error(`Retry envelope contains source identity signal: ${identityMatches[0].value}`);
  const next = structuredClone(originalRequest);
  next.input[0].content[0].text = JSON.stringify({ original: JSON.parse(originalRequest.input[0].content[0].text), retry: correction });
  validateSealedRequest(next, guards);
  return next;
};
const redactRetryEvidence = (value, originalRequest, guards = {}) => {
  const originalEnvelope = JSON.parse(originalRequest.input[0].content[0].text);
  const signals = [
    ...(guards.leakSignals?.signals ?? []).map((item) => item.value),
    ...(originalEnvelope.payload?.identityExclusions?.exactSignals ?? []).filter((item) => String(item).trim().split(/\s+/).length >= 2),
    guards.projectRoot, guards.libraryRoot,
  ].filter(Boolean).sort((left, right) => String(right).length - String(left).length);
  const redactString = (text) => signals.reduce((output, signal) => output.replace(new RegExp(String(signal).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'giu'), '[REDACTED]'), String(text));
  const visit = (item) => Array.isArray(item) ? item.map(visit) : item && typeof item === 'object' ? Object.fromEntries(Object.entries(item).map(([key, entry]) => [key, visit(entry)])) : typeof item === 'string' ? redactString(item) : item;
  return visit(value);
};
const postResponses = async (request, options = {}) => {
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is required for sealed API generation.');
  const response = await (options.fetchImpl ?? fetch)('https://api.openai.com/v1/responses', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(request) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Sealed Responses API failed (${response.status}): ${body?.error?.message ?? 'unknown API error'}`);
  if (body.status && body.status !== 'completed') throw new Error(`Sealed Responses API returned ${body.status}.`);
  const text = outputText(body);
  if (!text) throw new Error('Sealed Responses API returned no structured output.');
  let parsed; try { parsed = JSON.parse(text); } catch { throw new Error('Sealed Responses API returned invalid JSON.'); }
  return { response: body, output: parsed, returnedModel: body.model ?? null };
};
const materializeOutput = async (output, outputRoot, expectedStillSha256) => {
  if (!output || !Array.isArray(output.files) || output.inspection?.stillSha256 !== expectedStillSha256) throw new Error('Structured output does not prove inspection of the staged still.');
  if (Object.keys(output).sort().join(',') !== 'files,inspection' || Object.keys(output.inspection).join(',') !== 'stillSha256') throw new Error('Structured output contains unexpected manifest fields.');
  if (output.files.length < 1 || output.files.length > 20 || Buffer.byteLength(JSON.stringify(output)) > MAX_STRUCTURED_OUTPUT_BYTES) throw new Error('Structured output has an invalid file count or exceeds the 2 MiB limit.');
  const paths = new Set();
  for (const file of output.files) {
    if (!file || Object.keys(file).sort().join(',') !== 'content,path' || typeof file.path !== 'string' || typeof file.content !== 'string') throw new Error('Structured output files require only path and UTF-8 text content.');
    if (!/^(?:index\.html|styles\.css|script\.js|assets\/[A-Za-z0-9._/-]+\.(?:html|css|js|json|txt|svg))$/.test(file.path) || file.path.split('/').includes('..')) throw new Error(`Structured output contains an invalid path: ${file.path}`);
    if (paths.has(file.path)) throw new Error(`Structured output contains a duplicate path: ${file.path}`);
    if (/data:[^,;]+;base64,/i.test(file.content)) throw new Error(`Structured output embeds a binary data URI in ${file.path}.`);
    paths.add(file.path);
  }
  await rm(outputRoot, { recursive: true, force: true }); await mkdir(outputRoot, { recursive: true });
  for (const file of output.files) {
    const destination = resolve(outputRoot, file.path); assertContainedPath(destination, outputRoot); await mkdir(dirname(destination), { recursive: true }); await writeFile(destination, file.content, 'utf8');
  }
  if (!existsSync(resolve(outputRoot, 'index.html'))) throw new Error('Structured output is missing index.html.');
};
const runSealedGeneration = async (payload, stillPath, outputRoot, options = {}) => {
  if (options.explicitApiOptIn !== true) throw new Error('Sealed API generation requires explicitApiOptIn: true. Subscription-backed Codex is the default.');
  const original = await buildSealedRequest(payload, stillPath, options.guards); let request = original; let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const result = await postResponses(request, options); await materializeOutput(result.output, outputRoot, payload.reference.sha256);
    try {
      const validation = options.validateAttempt ? await options.validateAttempt(outputRoot, { attempt, result }) : null;
      return { isolationMode: 'sealed-api', developmentModelOverride: request.model !== RELEASE_MODEL, attempt: attempt + 1, requestedModel: request.model, returnedModel: result.returnedModel, validation, response: result.response };
    } catch (error) {
      lastError = error; if (attempt === 2) break;
      const suppliedEvidence = options.retryEvidence ? await options.retryEvidence(outputRoot, error) : { previousFiles: result.output.files, failures: [error.message] };
      const retryEvidence = redactRetryEvidence(suppliedEvidence, original, options.guards);
      request = buildRetryRequest(original, retryEvidence, options.guards);
    }
  }
  throw new Error(`Sealed generation failed after three attempts: ${lastError?.message ?? 'validation failed'}`);
};
const createDegradedApproval = ({ acknowledged, action, approver, generationId, degradedCause, reason }) => {
  if (acknowledged !== DEGRADED_WARNING || action !== DEGRADED_ACTION) throw new Error('Degraded generation requires the exact warning acknowledgement and explicit action.');
  if (!approver?.trim() || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(generationId ?? '')) throw new Error('Degraded approval requires an approver and valid generation ID.');
  if (!['subscription-unavailable', 'subscription-failure'].includes(degradedCause)) throw new Error('Degraded generation is available only after the subscription-backed Codex runner is unavailable or fails.');
  return { mode: 'degraded', isolationMode: 'degraded', isolated: false, warning: DEGRADED_WARNING, action: DEGRADED_ACTION, approver, generationId, degradedCause, reason: reason ?? degradedCause, approvedAt: new Date().toISOString(), explicitApproval: true };
};

const main = async () => {
  const [command, first, second, third] = process.argv.slice(2);
  if (command === 'build-request' && first && second) { const payload = JSON.parse(await readFile(resolve(first), 'utf8')); console.log(JSON.stringify(await buildSealedRequest(payload, resolve(second)), null, 2)); return; }
  if ((command === 'run' || command === 'run-subscription') && first && second && third) { const payload = JSON.parse(await readFile(resolve(first), 'utf8')); console.log(JSON.stringify(await runSubscriptionGeneration(payload, resolve(second), resolve(third)), null, 2)); return; }
  if (command === 'run-api' && first && second && third) { const payload = JSON.parse(await readFile(resolve(first), 'utf8')); console.log(JSON.stringify(await runSealedGeneration(payload, resolve(second), resolve(third), { explicitApiOptIn: true }), null, 2)); return; }
  throw new Error('Usage: isolation-runner.mjs build-request <payload.json> <still> | run-subscription <payload.json> <still> <output-root> | run-api <payload.json> <still> <output-root>');
};
const isDirect = Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirect) main().catch((error) => { console.error(`Isolation runner: ${error.message}`); process.exitCode = 1; });

export { DEGRADED_ACTION, DEGRADED_WARNING, MAX_STRUCTURED_OUTPUT_BYTES, RELEASE_MODEL, SUBSCRIPTION_MODE, buildRetryRequest, buildSealedRequest, createDegradedApproval, createSubscriptionWorkspace, materializeOutput, outputSchema, postResponses, redactRetryEvidence, runSealedGeneration, runSubscriptionGeneration, sanitizedSubscriptionEnv, subscriptionCodexArgs, subscriptionFeatureStatus, subscriptionLoginStatus, validateIdentityPlacement, validateSealedRequest };
